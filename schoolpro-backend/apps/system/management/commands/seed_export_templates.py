"""
Management command to seed dynamic ExportTemplate models into database table "sys"."export_templates".
Specifically provides the official Academic Transcript (Bảng điểm kết quả học tập A4 Ngang)
template with complete dynamic placeholders and sample data.

Usage:
    python manage.py seed_export_templates
    python manage.py seed_export_templates --force
"""

from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.system.models.export_template import ExportTemplate, FileFormat, TemplateType
from apps.system.services.export_template_service import (
    DEFAULT_ACADEMIC_CODE,
    DEFAULT_ACADEMIC_CONTENT,
    DEFAULT_ACADEMIC_FOOTER,
    DEFAULT_ACADEMIC_HEADER,
    DEFAULT_ACADEMIC_PLACEHOLDERS,
    DEFAULT_ACADEMIC_SAMPLE_DATA,
    DEFAULT_ACADEMIC_STYLES,
    DEFAULT_ANNOUNCEMENT_CODE,
    DEFAULT_ANNOUNCEMENT_CONTENT,
    DEFAULT_ANNOUNCEMENT_FOOTER,
    DEFAULT_ANNOUNCEMENT_HEADER,
    DEFAULT_ANNOUNCEMENT_STYLES,
    DEFAULT_LEAVE_REQUEST_CODE,
    DEFAULT_LEAVE_REQUEST_CONTENT,
    DEFAULT_LEAVE_REQUEST_FOOTER,
    DEFAULT_LEAVE_REQUEST_HEADER,
    DEFAULT_LEAVE_REQUEST_STYLES,
    DEFAULT_TIMETABLE_CODE,
    DEFAULT_TIMETABLE_CONTENT,
    DEFAULT_TIMETABLE_FOOTER,
    DEFAULT_TIMETABLE_HEADER,
    DEFAULT_TIMETABLE_PLACEHOLDERS,
    DEFAULT_TIMETABLE_SAMPLE_DATA,
    DEFAULT_TIMETABLE_STYLES,
)


class Command(BaseCommand):
    help = "Seeds dynamic ExportTemplate documents into sys.export_templates table."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force overwrite existing templates with the latest code/styles/placeholders.",
        )

    def handle(self, *args: Any, **options: Any):
        force: bool = options.get("force", False)

        self.stdout.write(self.style.NOTICE("=================================================="))
        self.stdout.write(
            self.style.NOTICE(" 🌱 SEEDING DYNAMIC EXPORT TEMPLATES (sys.export_templates)")
        )
        self.stdout.write(self.style.NOTICE("==================================================\n"))

        with transaction.atomic():
            # 1. Official Academic Transcript Template (Bảng điểm kết quả học tập A4 Ngang)
            self._seed_academic_transcript_template(force=force)

            # 2. Official Timetable Template (Thời khóa biểu A4 Ngang)
            self._seed_timetable_template(force=force)

            # 3. Official Leave Request Template
            self._seed_leave_request_template(force=force)

            # 4. Official Announcement Template
            self._seed_announcement_template(force=force)

        self.stdout.write(
            self.style.SUCCESS(
                "\n✅ Hoàn tất khởi tạo và cập nhật các mẫu biểu ExportTemplate vào cơ sở dữ liệu!"
            )
        )

    def _seed_academic_transcript_template(self, force: bool = False) -> None:
        """
        Seeds or updates the official Academic Transcript (Bảng điểm kết quả học tập)
        template in sys.export_templates.
        """
        self.stdout.write("  -> Đang kiểm tra Mẫu Bảng điểm học tập (ACADEMIC)...")

        # Check existing by code or type
        existing = (
            ExportTemplate.objects.filter(code=DEFAULT_ACADEMIC_CODE).first()
            or ExportTemplate.objects.filter(
                template_type=TemplateType.ACADEMIC,
                is_default=True,
            ).first()
        )

        academic_fields = {
            "code": DEFAULT_ACADEMIC_CODE,
            "name": "Mẫu Bảng điểm kết quả học tập A4 Ngang",
            "description": (
                "Biểu mẫu bảng điểm kết quả học tập A4 khổ ngang chuẩn Bộ Giáo dục và Đào tạo, "
                "hỗ trợ đánh giá thường xuyên 5 lần, giữa kỳ, cuối kỳ, điểm trung bình môn, xếp loại, "
                "nhận xét của giáo viên bộ môn và giáo viên chủ nhiệm."
            ),
            "template_type": TemplateType.ACADEMIC,
            "file_format": FileFormat.HTML_PRINT,
            "header_content": DEFAULT_ACADEMIC_HEADER,
            "content": DEFAULT_ACADEMIC_CONTENT,
            "footer_content": DEFAULT_ACADEMIC_FOOTER,
            "style_content": DEFAULT_ACADEMIC_STYLES,
            "page_size": "A4",
            "page_orientation": "LANDSCAPE",
            "margins": {"top": "8mm", "right": "12mm", "bottom": "7mm", "left": "15mm"},
            "placeholders_schema": DEFAULT_ACADEMIC_PLACEHOLDERS,
            "sample_data": DEFAULT_ACADEMIC_SAMPLE_DATA,
            "is_default": True,
            "is_active": True,
        }

        if existing:
            if force or existing.code != DEFAULT_ACADEMIC_CODE or not existing.style_content:
                for k, v in academic_fields.items():
                    setattr(existing, k, v)
                existing.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"     [UPDATED] Đã cập nhật mẫu bảng điểm (ID: {existing.id}, Code: {existing.code})"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"     [EXISTS] Mẫu bảng điểm đã tồn tại (ID: {existing.id}, Code: {existing.code}). Dùng --force để ghi đè."
                    )
                )
        else:
            created = ExportTemplate.objects.create(**academic_fields)
            self.stdout.write(
                self.style.SUCCESS(
                    f"     [CREATED] Đã tạo mới mẫu bảng điểm (ID: {created.id}, Code: {created.code})"
                )
            )

    def _seed_timetable_template(self, force: bool = False) -> None:
        """
        Seeds or updates the official Timetable (Thời khóa biểu A4 Ngang)
        template in sys.export_templates.
        """
        self.stdout.write("  -> Đang kiểm tra Mẫu Thời khóa biểu tuần (TIMETABLE)...")

        existing = ExportTemplate.objects.filter(code=DEFAULT_TIMETABLE_CODE).first()

        timetable_fields = {
            "code": DEFAULT_TIMETABLE_CODE,
            "name": "Mẫu Thời khóa biểu Tuần A4 Ngang",
            "description": (
                "Biểu mẫu thời khóa biểu tuần học tập A4 khổ ngang chuẩn sư phạm, hỗ trợ ma trận tiết học, "
                "thông tin lớp, phòng học, giáo viên bộ môn, chữ ký duyệt và tùy biến định dạng tải xuống."
            ),
            "template_type": TemplateType.ACADEMIC,
            "file_format": FileFormat.HTML_PRINT,
            "header_content": DEFAULT_TIMETABLE_HEADER,
            "content": DEFAULT_TIMETABLE_CONTENT,
            "footer_content": DEFAULT_TIMETABLE_FOOTER,
            "style_content": DEFAULT_TIMETABLE_STYLES,
            "page_size": "A4",
            "page_orientation": "LANDSCAPE",
            "margins": {"top": "8mm", "right": "10mm", "bottom": "8mm", "left": "10mm"},
            "placeholders_schema": DEFAULT_TIMETABLE_PLACEHOLDERS,
            "sample_data": DEFAULT_TIMETABLE_SAMPLE_DATA,
            "is_default": True,
            "is_active": True,
        }

        if existing:
            if force or not existing.style_content or existing.file_format != FileFormat.HTML_PRINT:
                for k, v in timetable_fields.items():
                    setattr(existing, k, v)
                existing.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"     [UPDATED] Đã cập nhật mẫu thời khóa biểu (ID: {existing.id}, Code: {existing.code})"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"     [EXISTS] Mẫu thời khóa biểu đã tồn tại (ID: {existing.id}, Code: {existing.code}). Dùng --force để ghi đè."
                    )
                )
        else:
            created = ExportTemplate.objects.create(**timetable_fields)
            self.stdout.write(
                self.style.SUCCESS(
                    f"     [CREATED] Đã tạo mới mẫu thời khóa biểu (ID: {created.id}, Code: {created.code})"
                )
            )

    def _seed_leave_request_template(self, force: bool = False) -> None:
        """Seeds official Leave Request Template."""
        self.stdout.write("  -> Đang kiểm tra Mẫu Đơn xin nghỉ phép (LEAVE_REQUEST)...")
        existing = ExportTemplate.objects.filter(code=DEFAULT_LEAVE_REQUEST_CODE).first()
        if not existing:
            created = ExportTemplate.objects.create(
                code=DEFAULT_LEAVE_REQUEST_CODE,
                name="Mẫu Đơn xin nghỉ phép A4 Chuẩn",
                description="Biểu mẫu đơn xin nghỉ phép A4 chuẩn hành chính nhà trường",
                template_type=TemplateType.ATTENDANCE,
                file_format=FileFormat.HTML_PRINT,
                header_content=DEFAULT_LEAVE_REQUEST_HEADER,
                content=DEFAULT_LEAVE_REQUEST_CONTENT,
                footer_content=DEFAULT_LEAVE_REQUEST_FOOTER,
                style_content=DEFAULT_LEAVE_REQUEST_STYLES,
                page_size="A4",
                page_orientation="PORTRAIT",
                margins={"top": "15mm", "right": "15mm", "bottom": "15mm", "left": "20mm"},
                is_default=True,
                is_active=True,
            )
            self.stdout.write(
                self.style.SUCCESS(f"     [CREATED] Đã tạo mẫu Đơn nghỉ phép (ID: {created.id})")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"     [EXISTS] Mẫu Đơn nghỉ phép đã có sẵn (ID: {existing.id})")
            )

    def _seed_announcement_template(self, force: bool = False) -> None:
        """Seeds official Announcement Template."""
        self.stdout.write("  -> Đang kiểm tra Mẫu Thông báo & Công văn (ANNOUNCEMENT)...")
        existing = ExportTemplate.objects.filter(code=DEFAULT_ANNOUNCEMENT_CODE).first()
        if not existing:
            created = ExportTemplate.objects.create(
                code=DEFAULT_ANNOUNCEMENT_CODE,
                name="Mẫu Thông báo & Công văn A4 Chuẩn",
                description="Biểu mẫu công văn thông báo A4 chuẩn Nghị định 30/2020/NĐ-CP",
                template_type=TemplateType.ANNOUNCEMENT,
                file_format=FileFormat.HTML_PRINT,
                header_content=DEFAULT_ANNOUNCEMENT_HEADER,
                content=DEFAULT_ANNOUNCEMENT_CONTENT,
                footer_content=DEFAULT_ANNOUNCEMENT_FOOTER,
                style_content=DEFAULT_ANNOUNCEMENT_STYLES,
                page_size="A4",
                page_orientation="PORTRAIT",
                margins={"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "20mm"},
                is_default=True,
                is_active=True,
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"     [CREATED] Đã tạo mẫu Thông báo công văn (ID: {created.id})"
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"     [EXISTS] Mẫu Thông báo đã có sẵn (ID: {existing.id})")
            )
