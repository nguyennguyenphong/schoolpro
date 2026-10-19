"""
Service layer for Attendance and Leave Requests domain.
Implements business rules for:
- Bulk daily & period roll-call marking with automatic audit logging
- Excuse reason attachment and parent notification triggers
- Leave application submission and homeroom teacher review workflow
"""

import logging
from datetime import date
from typing import Any
from uuid import UUID

from django.db import transaction
from django.utils import timezone

from apps.academic.models.attendance import Attendance, AttendanceLog, LeaveRequest
from apps.core.models.profile import Student
from apps.core.models.user import User

logger = logging.getLogger(__name__)


class AttendanceService:
    """
    Business service handling attendance roll-calls, status changes, and leave requests.
    """

    @classmethod
    @transaction.atomic
    def bulk_mark_attendance(
        cls,
        class_id: UUID,
        attendance_date: date,
        records: list[dict[str, Any]],
        recorded_by: User,
        period_id: UUID | None = None,
    ) -> list[Attendance]:
        """
        Record or update attendance for multiple students in a class.
        Automatically produces an AttendanceLog entry on create or status transition.
        """
        saved_records = []

        for item in records:
            student_id = item["student_id"]
            new_status = item["status"]
            check_in_time = item.get("check_in_time")
            method = item.get("method", "MANUAL")
            device_id = item.get("device_id")
            excuse_reason = item.get("excuse_reason")
            excuse_document_url = item.get("excuse_document_url")
            note = item.get("note")

            att_record, created = Attendance.objects.get_or_create(
                student_id=student_id,
                attendance_date=attendance_date,
                period_id=period_id,
                defaults={
                    "school_class_id": class_id,
                    "status": new_status,
                    "check_in_time": check_in_time,
                    "method": method,
                    "device_id": device_id,
                    "excuse_reason": excuse_reason,
                    "excuse_document_url": excuse_document_url,
                    "note": note,
                    "recorded_by": recorded_by,
                },
            )

            previous_status = None
            if not created:
                previous_status = att_record.status
                att_record.status = new_status
                if check_in_time is not None:
                    att_record.check_in_time = check_in_time
                att_record.method = method
                if device_id:
                    att_record.device_id = device_id
                if excuse_reason is not None:
                    att_record.excuse_reason = excuse_reason
                if excuse_document_url is not None:
                    att_record.excuse_document_url = excuse_document_url
                if note is not None:
                    att_record.note = note
                att_record.save()

            # Record audit trail in AttendanceLog
            action = "INITIAL_ROLL_CALL" if created else "STATUS_UPDATED"
            AttendanceLog.objects.create(
                attendance=att_record,
                student_id=student_id,
                previous_status=previous_status,
                new_status=new_status,
                action=action,
                method=method,
                reason=excuse_reason
                or note
                or ("Initial roll-call" if created else "Teacher update"),
                performed_by=recorded_by,
                metadata={"method": method, "period_id": str(period_id) if period_id else None},
            )

            saved_records.append(att_record)

        logger.info(
            "Class %s: Marked %d attendance records for %s by user %s",
            class_id,
            len(saved_records),
            attendance_date,
            recorded_by.id,
        )
        return saved_records

    @classmethod
    @transaction.atomic
    def submit_leave_request(
        cls,
        student_id: UUID,
        start_date: date,
        end_date: date,
        reason: str,
        requested_by: User,
        leave_type: str = "SICK",
        guardian_id: UUID | None = None,
        supporting_document_url: str | None = None,
    ) -> LeaveRequest:
        """
        Submit a formal student absence/leave request.
        """
        student = Student.objects.select_related("current_class").get(id=student_id)
        class_id = student.current_class_id
        if not class_id:
            # Fallback to student class enrollment if current_class is None
            enrollment = student.class_enrollments.filter(status="ACTIVE").first()
            if enrollment:
                class_id = enrollment.school_class_id
            else:
                raise ValueError("Student is not currently enrolled in any class.")

        leave_req = LeaveRequest.objects.create(
            student=student,
            school_class_id=class_id,
            guardian_id=guardian_id,
            requested_by=requested_by,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            leave_type=leave_type,
            status="PENDING",
            supporting_document_url=supporting_document_url,
        )
        logger.info("Submitted leave request %s for student %s", leave_req.id, student_id)
        return leave_req

    @classmethod
    @transaction.atomic
    def review_leave_request(
        cls,
        leave_request_id: UUID,
        action: str,
        reviewer: User,
        teacher_note: str = "",
    ) -> LeaveRequest:
        """
        Approve or reject a student leave request.
        If approved, automatically pre-creates or updates Attendance records as ABSENT_EXCUSED.
        """
        leave_req = (
            LeaveRequest.objects.select_for_update()
            .select_related(
                "student",
                "school_class",
                "school_class__homeroom_teacher",
                "school_class__homeroom_teacher__user",
            )
            .get(id=leave_request_id)
        )
        if leave_req.status != "PENDING":
            raise ValueError(
                f"Đơn xin nghỉ phép đã ở trạng thái '{leave_req.status}', không thể xử lý lại."
            )

        homeroom_teacher = (
            getattr(leave_req.school_class, "homeroom_teacher", None)
            if leave_req.school_class
            else None
        )
        homeroom_user_id = getattr(homeroom_teacher, "user_id", None) if homeroom_teacher else None
        is_authorized_reviewer = (
            getattr(reviewer, "is_superuser", False)
            or getattr(reviewer, "is_staff", False)
            or (homeroom_user_id is not None and str(homeroom_user_id) == str(reviewer.id))
        )
        if not is_authorized_reviewer:
            raise ValueError(
                "Chỉ Giáo viên chủ nhiệm của lớp mới có thẩm quyền phê duyệt đơn xin nghỉ phép. Giáo viên bộ môn chỉ nhận thông báo."
            )

        new_status = "APPROVED" if action.upper() == "APPROVE" else "REJECTED"
        cleaned_note = (teacher_note or "").strip()
        if new_status == "REJECTED" and not cleaned_note:
            raise ValueError("Bắt buộc ghi rõ lý do từ chối đơn xin nghỉ phép.")

        review_time = timezone.now()
        leave_req.status = new_status
        leave_req.reviewed_by = reviewer
        leave_req.reviewed_at = review_time
        leave_req.teacher_note = cleaned_note
        leave_req.is_auto_approved = False
        meta = leave_req.metadata if isinstance(leave_req.metadata, dict) else {}
        meta["approvalMethod"] = "MANUAL"
        leave_req.metadata = meta
        leave_req.save()

        from apps.academic.services.leave_request_service import LeaveRequestService

        reviewer_name = reviewer.full_name or "Giáo viên chủ nhiệm"
        if new_status == "APPROVED":
            LeaveRequestService.record_event_log(
                leave_request=leave_req,
                event_type="APPROVED",
                title="Giáo viên chủ nhiệm đã phê duyệt đơn xin nghỉ phép",
                description=(
                    teacher_note
                    or "Giáo viên chủ nhiệm đã đồng ý phê duyệt đơn xin nghỉ phép và cập nhật trạng thái Vắng có phép."
                ),
                actor_name=f"Giáo viên chủ nhiệm: {reviewer_name}",
                actor_role="HOMEROOM_TEACHER",
                badge_text="Đã phê duyệt",
                badge_color="success",
                created_at=review_time,
            )
        else:
            LeaveRequestService.record_event_log(
                leave_request=leave_req,
                event_type="REJECTED",
                title="Giáo viên chủ nhiệm từ chối đơn xin nghỉ phép",
                description=(
                    teacher_note
                    or "Đơn xin nghỉ phép không được chấp thuận. Vui lòng xem ghi chú từ Giáo viên chủ nhiệm."
                ),
                actor_name=f"Giáo viên chủ nhiệm: {reviewer_name}",
                actor_role="HOMEROOM_TEACHER",
                badge_text="Từ chối",
                badge_color="error",
                created_at=review_time,
            )

        # If approved, update attendance entries for the date range
        if new_status == "APPROVED":
            current_date = leave_req.start_date
            while current_date <= leave_req.end_date:
                # Do not count Sundays
                if current_date.weekday() != 6:
                    att, created = Attendance.objects.get_or_create(
                        student_id=leave_req.student_id,
                        attendance_date=current_date,
                        period_id=None,
                        defaults={
                            "school_class_id": leave_req.school_class_id,
                            "status": "ABSENT_EXCUSED",
                            "method": "MANUAL",
                            "excuse_reason": f"Approved leave request: {leave_req.reason}",
                            "recorded_by": reviewer,
                        },
                    )
                    prev_status = None
                    if not created and att.status != "ABSENT_EXCUSED":
                        prev_status = att.status
                        att.status = "ABSENT_EXCUSED"
                        att.excuse_reason = f"Approved leave request: {leave_req.reason}"
                        att.save()

                    AttendanceLog.objects.create(
                        attendance=att,
                        student_id=leave_req.student_id,
                        previous_status=prev_status,
                        new_status="ABSENT_EXCUSED",
                        action="EXCUSE_ATTACHED",
                        reason=f"Approved leave request #{leave_req.id}",
                        performed_by=reviewer,
                    )
                # Next day
                current_date = current_date.fromordinal(current_date.toordinal() + 1)

        LeaveRequestService.send_approval_notifications(leave_req, is_auto=False)

        try:
            from apps.academic.services.leave_request_realtime import (
                LeaveRequestRealtimeEvent,
                LeaveRequestRealtimeService,
            )

            formatted_item = LeaveRequestService.format_leave_request_item(
                leave_req, include_logs=True
            )
            status_label_vi = "đã được phê duyệt" if new_status == "APPROVED" else "bị từ chối"
            LeaveRequestRealtimeService.broadcast_event(
                event_type=LeaveRequestRealtimeEvent.REVIEWED,
                leave_request=leave_req,
                item_data=formatted_item,
                message=f"Đơn xin nghỉ phép #{leave_req.code} {status_label_vi} bởi {reviewer_name}.",
                actor_name=reviewer_name,
            )
        except Exception as exc:
            logger.debug("Review realtime broadcast skipped: %s", exc)

        logger.info(
            "Leave request %s %s by reviewer %s",
            leave_req.id,
            new_status,
            reviewer.id,
        )
        return leave_req
