"""
Management command to seed realistic Student Leave Requests.
Table: "academic"."leave_requests"

Usage:
    python manage.py seed_leave_requests
"""

from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.academic.models.attendance import LeaveRequest, LeaveRequestEventLog
from apps.academic.services.leave_request_service import LeaveRequestService
from apps.core.models.organization import SchoolClass, StudentClassEnrollment
from apps.core.models.profile import Guardian, Student
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds realistic student leave requests with 12-digit codes, approval deadlines, auto-approval, and chronological event logs."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding Student Leave Requests (academic.leave_requests)...")
        )

        school_class = (
            SchoolClass.objects.select_related("homeroom_teacher", "homeroom_teacher__user")
            .filter(name="10A1")
            .first()
        )
        if not school_class:
            school_class = SchoolClass.objects.select_related(
                "homeroom_teacher", "homeroom_teacher__user"
            ).first()

        if not school_class:
            self.stdout.write(self.style.ERROR("No SchoolClass found. Please seed classes first."))
            return

        enrollments = (
            StudentClassEnrollment.objects.filter(school_class=school_class, status="ACTIVE")
            .select_related("student", "student__user")
            .all()
        )
        students = [e.student for e in enrollments if e.student]
        if not students:
            students = list(Student.objects.select_related("user").all()[:5])

        if not students:
            self.stdout.write(self.style.ERROR("No Student found. Please seed students first."))
            return

        reviewer = (
            school_class.homeroom_teacher.user
            if school_class.homeroom_teacher and school_class.homeroom_teacher.user
            else students[0].user
        )

        today = date.today()
        now = timezone.now()

        sample_templates = [
            {
                "leave_type": "SICK",
                "status": "APPROVED",
                "is_auto_approved": False,
                "offset_start": -10,
                "duration": 1,
                "session_shift": "all_day",
                "reason": "Em bị sốt siêu vi 39 độ, đau họng và mệt mỏi, đã đi khám tại Bệnh viện Đa khoa Khu vực và bác sĩ chỉ định nghỉ ngơi tại nhà 1 ngày.",
                "teacher_note": "Cô đã nhận được giấy khám bệnh từ phụ huynh. Chúc em mau khỏe, nhớ mượn vở bạn chép bài đầy đủ nhé!",
                "supporting_document_url": "https://schoolpro.edu.vn/documents/giay-kham-benh-01.pdf",
                "attachments": [
                    {
                        "id": "att-sick-01",
                        "name": "Giay_kham_benh_BV_Da_Khoa.pdf",
                        "url": "https://schoolpro.edu.vn/documents/giay-kham-benh-01.pdf",
                        "size": "485 KB",
                        "type": "pdf",
                    }
                ],
            },
            {
                "leave_type": "OFFICIAL_COMPETITION",
                "status": "APPROVED",
                "is_auto_approved": True,
                "offset_start": -4,
                "duration": 1,
                "session_shift": "morning",
                "reason": "Em được triệu tập tham gia Đội tuyển Học sinh giỏi cấp Tỉnh môn Toán học và tập huấn tập trung theo quyết định của Ban Giám hiệu nhà trường.",
                "teacher_note": "Hệ thống tự động phê duyệt đơn xin nghỉ phép do đã đến hạn 3 giờ trước thời gian diễn ra tiết học đầu tiên mà chưa có phản hồi từ Giáo viên chủ nhiệm.",
                "supporting_document_url": "https://schoolpro.edu.vn/documents/quyet-dinh-doi-tuyen.pdf",
                "attachments": [
                    {
                        "id": "att-comp-01",
                        "name": "Quyet_dinh_trieu_tap_HSG.pdf",
                        "url": "https://schoolpro.edu.vn/documents/quyet-dinh-trieu-tap.pdf",
                        "size": "320 KB",
                        "type": "pdf",
                    }
                ],
            },
            {
                "leave_type": "FAMILY_AFFAIR",
                "status": "PENDING",
                "is_auto_approved": False,
                "offset_start": 3,
                "duration": 1,
                "session_shift": "morning",
                "reason": "Gia đình em có việc bận đột xuất phải về quê nội tại Nam Định trong buổi sáng, gia đình đã trao đổi và xin phép giáo viên chủ nhiệm.",
                "teacher_note": "",
                "supporting_document_url": None,
                "attachments": [],
            },
            {
                "leave_type": "SICK",
                "status": "PENDING",
                "is_auto_approved": False,
                "offset_start": 5,
                "duration": 1,
                "session_shift": "all_day",
                "reason": "Em có lịch tái khám định kỳ răng hàm mặt và kiểm tra thị lực theo lịch hẹn của bác sĩ chuyên khoa.",
                "teacher_note": "",
                "supporting_document_url": "https://schoolpro.edu.vn/documents/phieu-hen-tai-kham.jpg",
                "attachments": [
                    {
                        "id": "att-checkup-01",
                        "name": "Phieu_hen_tai_kham_BS.jpg",
                        "url": "https://schoolpro.edu.vn/documents/phieu-hen-tai-kham.jpg",
                        "size": "612 KB",
                        "type": "image",
                    }
                ],
            },
            {
                "leave_type": "OTHER",
                "status": "REJECTED",
                "is_auto_approved": False,
                "offset_start": -16,
                "duration": 1,
                "session_shift": "all_day",
                "reason": "Em xin nghỉ học để đi làm căn cước công dân và giải quyết thủ tục cá nhân.",
                "teacher_note": "Lịch học hôm đó có bài kiểm tra định kỳ 1 tiết môn Vật lý. Em nên sắp xếp làm CCCD vào ngày cuối tuần để không ảnh hưởng bài kiểm tra.",
                "supporting_document_url": None,
                "attachments": [],
            },
        ]

        created_count = 0
        updated_count = 0
        logs_seeded = 0

        with transaction.atomic():
            existing_reqs = LeaveRequest.objects.select_related(
                "school_class",
                "school_class__homeroom_teacher",
                "school_class__homeroom_teacher__user",
                "student",
                "student__user",
                "reviewed_by",
            ).all()

            for req in existing_reqs:
                needs_save = False
                if not req.code or len(str(req.code).strip()) != 12 or not str(req.code).isdigit():
                    req.code = generate_unique_code(LeaveRequest, field_name="code", length=12)
                    needs_save = True

                meta = req.metadata if isinstance(req.metadata, dict) else {}
                shift = meta.get("sessionShift", "all_day")

                # Ensure start_date falls on a weekday with timetable lessons
                affected_lessons, notified_teachers = (
                    LeaveRequestService.compute_affected_lessons_for_class(
                        school_class=req.school_class or school_class,
                        start_date=req.start_date,
                        end_date=req.end_date,
                        session_shift=shift,
                    )
                )
                if not affected_lessons and shift != "all_day":
                    shift = "all_day"
                    meta["sessionShift"] = "all_day"
                    affected_lessons, notified_teachers = (
                        LeaveRequestService.compute_affected_lessons_for_class(
                            school_class=req.school_class or school_class,
                            start_date=req.start_date,
                            end_date=req.end_date,
                            session_shift=shift,
                        )
                    )
                if not affected_lessons:
                    # Shift date by +1 day until we hit an active timetable day
                    for add_d in range(1, 7):
                        cand_start = req.start_date + timedelta(days=add_d)
                        cand_end = req.end_date + timedelta(days=add_d)
                        affected_lessons, notified_teachers = (
                            LeaveRequestService.compute_affected_lessons_for_class(
                                school_class=req.school_class or school_class,
                                start_date=cand_start,
                                end_date=cand_end,
                                session_shift=shift,
                            )
                        )
                        if affected_lessons:
                            req.start_date = cand_start
                            req.end_date = cand_end
                            needs_save = True
                            break

                first_lesson_dt, deadline_dt = (
                    LeaveRequestService.calculate_first_lesson_and_deadline(
                        affected_lessons=affected_lessons,
                        fallback_start_date=req.start_date,
                    )
                )
                meta["affectedLessons"] = affected_lessons
                meta["notifiedTeachers"] = notified_teachers
                meta["approvalPolicy"] = "HOMEROOM_TEACHER_ONLY"
                meta["firstLessonStartAt"] = first_lesson_dt.isoformat()
                meta["approvalDeadline"] = deadline_dt.isoformat()
                req.metadata = meta

                if req.approval_deadline != deadline_dt:
                    req.approval_deadline = deadline_dt
                    needs_save = True

                # If PENDING but start_date is already in the past, move start_date into the future so it stays PENDING for demo
                if req.status == "PENDING" and deadline_dt <= now:
                    for add_d in range(2, 9):
                        cand_start = today + timedelta(days=add_d)
                        cand_end = cand_start
                        cand_lessons, cand_teachers = (
                            LeaveRequestService.compute_affected_lessons_for_class(
                                school_class=req.school_class or school_class,
                                start_date=cand_start,
                                end_date=cand_end,
                                session_shift=shift,
                            )
                        )
                        if cand_lessons:
                            req.start_date = cand_start
                            req.end_date = cand_end
                            first_lesson_dt, deadline_dt = (
                                LeaveRequestService.calculate_first_lesson_and_deadline(
                                    affected_lessons=cand_lessons,
                                    fallback_start_date=req.start_date,
                                )
                            )
                            meta["affectedLessons"] = cand_lessons
                            meta["notifiedTeachers"] = cand_teachers
                            meta["firstLessonStartAt"] = first_lesson_dt.isoformat()
                            meta["approvalDeadline"] = deadline_dt.isoformat()
                            req.metadata = meta
                            req.approval_deadline = deadline_dt
                            needs_save = True
                            break

                if needs_save:
                    req.save()
                    updated_count += 1

                # Re-build event logs so all logs have accurate timestamps and new workflow steps
                LeaveRequestEventLog.objects.filter(leave_request=req).delete()
                LeaveRequestService.ensure_event_logs_for_item(
                    item=req,
                    affected_lessons=meta["affectedLessons"],
                    notified_teachers=meta["notifiedTeachers"],
                    deadline_dt=req.approval_deadline,
                )
                logs_seeded += 1

            # Also mark one APPROVED request per student as is_auto_approved=True so user can see Auto-Approved workflow
            for student in students:
                approved_reqs = list(
                    LeaveRequest.objects.filter(student=student, status="APPROVED").order_by(
                        "-start_date"
                    )
                )
                if len(approved_reqs) >= 2 and not any(r.is_auto_approved for r in approved_reqs):
                    auto_req = approved_reqs[0]
                    auto_req.is_auto_approved = True
                    auto_req.reviewed_by = None
                    auto_req.reviewed_at = auto_req.approval_deadline or timezone.now()
                    auto_req.teacher_note = (
                        "Hệ thống tự động phê duyệt đơn xin nghỉ phép do đã đến hạn 3 giờ trước thời gian "
                        "diễn ra tiết học đầu tiên mà chưa có phản hồi từ Giáo viên chủ nhiệm."
                    )
                    meta = auto_req.metadata if isinstance(auto_req.metadata, dict) else {}
                    meta["isAutoApproved"] = True
                    auto_req.metadata = meta
                    auto_req.save()
                    LeaveRequestEventLog.objects.filter(leave_request=auto_req).delete()
                    LeaveRequestService.ensure_event_logs_for_item(
                        item=auto_req,
                        affected_lessons=meta.get("affectedLessons", []),
                        notified_teachers=meta.get("notifiedTeachers", []),
                        deadline_dt=auto_req.approval_deadline,
                    )

            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)
            wed_date = week_start + timedelta(days=2)
            fri_date = week_start + timedelta(days=4)

            for student in students:
                existing_count = LeaveRequest.objects.filter(student=student).count()
                if existing_count < 3:
                    guardian = (
                        Guardian.objects.filter(student=student)
                        .order_by("-is_primary_contact", "created_at")
                        .first()
                    )
                    guardian_name = guardian.full_name if guardian else "Nguyễn Văn Phụ Huynh"
                    guardian_phone = guardian.phone if guardian else "0912345678"
                    guardian_rel = guardian.relationship if guardian else "Bố"

                    for idx, tpl in enumerate(sample_templates):
                        start_dt = today + timedelta(days=tpl["offset_start"] + (idx % 2))
                        end_dt = start_dt + timedelta(days=tpl["duration"] - 1)
                        if start_dt.weekday() == 6:
                            start_dt += timedelta(days=1)
                            end_dt += timedelta(days=1)

                        shift = tpl["session_shift"]
                        affected_lessons, notified_teachers = (
                            LeaveRequestService.compute_affected_lessons_for_class(
                                school_class=school_class,
                                start_date=start_dt,
                                end_date=end_dt,
                                session_shift=shift,
                            )
                        )
                        if not affected_lessons:
                            shift = "all_day"
                            affected_lessons, notified_teachers = (
                                LeaveRequestService.compute_affected_lessons_for_class(
                                    school_class=school_class,
                                    start_date=start_dt,
                                    end_date=end_dt,
                                    session_shift=shift,
                                )
                            )

                        first_lesson_dt, deadline_dt = (
                            LeaveRequestService.calculate_first_lesson_and_deadline(
                                affected_lessons=affected_lessons,
                                fallback_start_date=start_dt,
                            )
                        )

                        is_auto = bool(tpl.get("is_auto_approved", False))
                        reviewed_by = (
                            None
                            if is_auto
                            else (reviewer if tpl["status"] in ("APPROVED", "REJECTED") else None)
                        )
                        reviewed_at = (
                            deadline_dt
                            if is_auto
                            else (
                                deadline_dt - timedelta(hours=2)
                                if tpl["status"] in ("APPROVED", "REJECTED")
                                else None
                            )
                        )

                        metadata = {
                            "sessionShift": shift,
                            "commitment": "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học.",
                            "guardianName": guardian_name,
                            "guardianPhone": guardian_phone,
                            "guardianRelationship": guardian_rel,
                            "attachments": tpl["attachments"],
                            "affectedLessons": affected_lessons,
                            "notifiedTeachers": notified_teachers,
                            "approvalPolicy": "HOMEROOM_TEACHER_ONLY",
                            "firstLessonStartAt": first_lesson_dt.isoformat(),
                            "approvalDeadline": deadline_dt.isoformat(),
                            "isAutoApproved": is_auto,
                        }

                        req = LeaveRequest.objects.create(
                            student=student,
                            school_class=school_class,
                            guardian=guardian,
                            requested_by=student.user,
                            start_date=start_dt,
                            end_date=end_dt,
                            reason=tpl["reason"],
                            leave_type=tpl["leave_type"],
                            status=tpl["status"],
                            supporting_document_url=tpl["supporting_document_url"],
                            teacher_note=tpl["teacher_note"] or None,
                            reviewed_by=reviewed_by,
                            reviewed_at=reviewed_at,
                            approval_deadline=deadline_dt,
                            is_auto_approved=is_auto,
                            metadata=metadata,
                        )
                        LeaveRequestService.ensure_event_logs_for_item(
                            item=req,
                            affected_lessons=affected_lessons,
                            notified_teachers=notified_teachers,
                            deadline_dt=deadline_dt,
                        )
                        created_count += 1

                # Ensure every student has at least 1 full-day APPROVED leave on Wednesday of current week
                # and 1 morning-shift leave on Friday of current week so current week Timetable highlights both
                current_week_leaves = list(
                    LeaveRequest.objects.filter(
                        student=student,
                        status__in=["APPROVED", "PENDING"],
                        start_date__lte=week_end,
                        end_date__gte=week_start,
                    )
                )
                has_all_day_in_week = any(
                    (isinstance(r.metadata, dict) and r.metadata.get("sessionShift") == "all_day")
                    for r in current_week_leaves
                )
                if not has_all_day_in_week:
                    target_req = (
                        LeaveRequest.objects.filter(student=student, status="APPROVED")
                        .order_by("start_date")
                        .first()
                    )
                    if target_req:
                        meta = target_req.metadata if isinstance(target_req.metadata, dict) else {}
                        meta["sessionShift"] = "all_day"
                        aff_lessons, notif_teachers = (
                            LeaveRequestService.compute_affected_lessons_for_class(
                                school_class=school_class,
                                start_date=wed_date,
                                end_date=wed_date,
                                session_shift="all_day",
                            )
                        )
                        first_dt, dl_dt = LeaveRequestService.calculate_first_lesson_and_deadline(
                            affected_lessons=aff_lessons,
                            fallback_start_date=wed_date,
                        )
                        meta["affectedLessons"] = aff_lessons
                        meta["notifiedTeachers"] = notif_teachers
                        meta["firstLessonStartAt"] = first_dt.isoformat()
                        meta["approvalDeadline"] = dl_dt.isoformat()
                        target_req.start_date = wed_date
                        target_req.end_date = wed_date
                        target_req.approval_deadline = dl_dt
                        target_req.metadata = meta
                        target_req.save()
                        LeaveRequestEventLog.objects.filter(leave_request=target_req).delete()
                        LeaveRequestService.ensure_event_logs_for_item(
                            item=target_req,
                            affected_lessons=aff_lessons,
                            notified_teachers=notif_teachers,
                            deadline_dt=dl_dt,
                        )
                        updated_count += 1

                current_week_leaves = list(
                    LeaveRequest.objects.filter(
                        student=student,
                        status__in=["APPROVED", "PENDING"],
                        start_date__lte=week_end,
                        end_date__gte=week_start,
                    )
                )
                has_shift_in_week = any(
                    (
                        isinstance(r.metadata, dict)
                        and r.metadata.get("sessionShift") in ("morning", "afternoon")
                    )
                    for r in current_week_leaves
                )
                if not has_shift_in_week:
                    shift_req = (
                        LeaveRequest.objects.filter(
                            student=student, status__in=["APPROVED", "PENDING"]
                        )
                        .exclude(start_date=wed_date)
                        .order_by("-start_date")
                        .first()
                    )
                    if shift_req:
                        meta = shift_req.metadata if isinstance(shift_req.metadata, dict) else {}
                        meta["sessionShift"] = "morning"
                        aff_lessons, notif_teachers = (
                            LeaveRequestService.compute_affected_lessons_for_class(
                                school_class=school_class,
                                start_date=fri_date,
                                end_date=fri_date,
                                session_shift="morning",
                            )
                        )
                        first_dt, dl_dt = LeaveRequestService.calculate_first_lesson_and_deadline(
                            affected_lessons=aff_lessons,
                            fallback_start_date=fri_date,
                        )
                        meta["affectedLessons"] = aff_lessons
                        meta["notifiedTeachers"] = notif_teachers
                        meta["firstLessonStartAt"] = first_dt.isoformat()
                        meta["approvalDeadline"] = dl_dt.isoformat()
                        shift_req.start_date = fri_date
                        shift_req.end_date = fri_date
                        if dl_dt <= now and shift_req.status == "PENDING":
                            shift_req.status = "APPROVED"
                            shift_req.is_auto_approved = True
                        shift_req.approval_deadline = dl_dt
                        shift_req.metadata = meta
                        shift_req.save()
                        LeaveRequestEventLog.objects.filter(leave_request=shift_req).delete()
                        LeaveRequestService.ensure_event_logs_for_item(
                            item=shift_req,
                            affected_lessons=aff_lessons,
                            notified_teachers=notif_teachers,
                            deadline_dt=dl_dt,
                        )
                        updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done! Created {created_count} new leave requests, updated {updated_count} records, and seeded event logs for {logs_seeded} existing requests."
            )
        )
