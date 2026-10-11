from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from common.models.base import UUIDModel


class Timetable(UUIDModel):
    """
    Timetable Model.

    Database Table: "academic"."timetables"
    Description: Weekly recurring timetable schedule slots by class, day of week, period, and venue
    """

    class DayOfWeek(models.IntegerChoices):
        MONDAY = 2, "Thứ Hai (2)"
        TUESDAY = 3, "Thứ Ba (3)"
        WEDNESDAY = 4, "Thứ Tư (4)"
        THURSDAY = 5, "Thứ Năm (5)"
        FRIDAY = 6, "Thứ Sáu (6)"
        SATURDAY = 7, "Thứ Bảy (7)"
        SUNDAY = 8, "Chủ Nhật (CN)"

    class ClassType(models.TextChoices):
        THEORY = "THEORY", "Lý thuyết"
        PRACTICE = "PRACTICE", "Thực hành"
        SEMINAR = "SEMINAR", "Chuyên đề / Seminar"
        EXAM = "EXAM", "Kiểm tra / Thi"
        EXTRACURRICULAR = "EXTRACURRICULAR", "Ngoại khóa"

    class LearningMode(models.TextChoices):
        OFFLINE = "OFFLINE", "Trực tiếp (Offline)"
        ONLINE = "ONLINE", "Trực tuyến (Online)"
        HYBRID = "HYBRID", "Kết hợp (Hybrid)"

    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="timetables",
        db_comment="class_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        related_name="+",
        db_comment="semester_id foreign key",
    )
    day_of_week = models.SmallIntegerField(
        choices=DayOfWeek.choices,
        validators=[MinValueValidator(2), MaxValueValidator(8)],
        help_text="Thứ trong tuần (2: Thứ Hai, ..., 8: Chủ Nhật)",
    )
    period = models.ForeignKey(
        "academic.Period",
        on_delete=models.CASCADE,
        db_column="period_id",
        related_name="+",
        db_comment="period_id foreign key",
    )
    class_subject_teacher = models.ForeignKey(
        "core.ClassSubjectTeacher",
        on_delete=models.CASCADE,
        db_column="class_subject_teacher_id",
        related_name="timetables",
        db_comment="class_subject_teacher_id foreign key",
    )
    room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="room_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="room_id foreign key",
    )
    class_type = models.CharField(
        max_length=20,
        choices=ClassType.choices,
        default=ClassType.THEORY,
    )
    learning_mode = models.CharField(
        max_length=20,
        choices=LearningMode.choices,
        default=LearningMode.OFFLINE,
    )
    is_online = models.BooleanField(
        default=False,
    )
    online_url = models.CharField(
        max_length=500,
        null=True,
        blank=True,
    )
    meeting_passcode = models.CharField(
        max_length=50,
        null=True,
        blank=True,
    )
    lesson_topic = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )
    curriculum_material_ids = models.JSONField(
        default=list,
        blank=True,
    )
    notes = models.TextField(
        null=True,
        blank=True,
    )
    color_theme = models.CharField(
        max_length=30,
        default="blue",
        null=True,
        blank=True,
    )
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    settings = models.JSONField(
        default=dict,
        blank=True,
    )

    class Meta:
        managed = False
        db_table = '"academic"."timetables"'
        verbose_name = "Timetable"
        verbose_name_plural = "Timetables"

    def clean(self):
        super().clean()
        if self.day_of_week is not None and not (2 <= self.day_of_week <= 8):
            raise ValidationError(
                {
                    "day_of_week": "Thứ trong tuần (day_of_week) phải từ 2 (Thứ Hai) đến 8 (Chủ Nhật)."
                }
            )
        if self.class_type and self.class_type not in self.ClassType.values:
            raise ValidationError(
                {
                    "class_type": f"Loại lớp học không hợp lệ. Chọn một trong: {', '.join(self.ClassType.values)}."
                }
            )
        if self.learning_mode and self.learning_mode not in self.LearningMode.values:
            raise ValidationError(
                {
                    "learning_mode": f"Hình thức học không hợp lệ. Chọn một trong: {', '.join(self.LearningMode.values)}."
                }
            )
        if self.effective_from and self.effective_to and self.effective_from > self.effective_to:
            raise ValidationError(
                {"effective_to": "Ngày kết thúc hiệu lực phải sau hoặc bằng ngày bắt đầu hiệu lực."}
            )

    def __str__(self) -> str:
        return f"{self.school_class} - {self.get_day_of_week_display()} - {self.period}"

    def __repr__(self) -> str:
        return f"<Timetable {self.pk}>"


class TimetableChange(UUIDModel):
    """
    TimetableChange Model.

    Database Table: "academic"."timetable_changes"
    Description: Daily operational substitutions and room change logs
    """

    class ChangeType(models.TextChoices):
        SUBSTITUTE_TEACHER = "SUBSTITUTE_TEACHER", "Dạy thay (Substitute Teacher)"
        ROOM_CHANGE = "ROOM_CHANGE", "Đổi phòng học (Room Change)"
        CANCELLED = "CANCELLED", "Hủy tiết (Cancelled)"
        MAKE_UP_CLASS = "MAKE_UP_CLASS", "Học bù (Make-up Class)"
        PERIOD_SWAP = "PERIOD_SWAP", "Đổi tiết (Period Swap)"

    class ChangeStatus(models.TextChoices):
        PENDING = "PENDING", "Chờ duyệt (Pending)"
        APPROVED = "APPROVED", "Đã duyệt (Approved)"
        REJECTED = "REJECTED", "Từ chối (Rejected)"
        CANCELLED = "CANCELLED", "Đã hủy (Cancelled)"

    timetable = models.ForeignKey(
        "academic.Timetable",
        on_delete=models.CASCADE,
        db_column="timetable_id",
        related_name="changes",
        db_comment="timetable_id foreign key",
    )
    change_date = models.DateField()
    change_type = models.CharField(
        max_length=20,
        choices=ChangeType.choices,
        default=ChangeType.ROOM_CHANGE,
    )
    substitute_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="new_teacher_id",
        related_name="timetable_substitutions",
        null=True,
        blank=True,
    )
    new_room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="new_room_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="new_room_id foreign key",
    )
    new_period = models.ForeignKey(
        "academic.Period",
        on_delete=models.SET_NULL,
        db_column="new_period_id",
        related_name="+",
        null=True,
        blank=True,
    )
    reason = models.TextField(null=True, blank=True)
    requested_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="requested_by",
        related_name="+",
        null=True,
        blank=True,
    )
    requested_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="approved_by",
        related_name="+",
        null=True,
        blank=True,
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=ChangeStatus.choices,
        default=ChangeStatus.APPROVED,
    )
    is_notified_to_class = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."timetable_changes"'
        verbose_name = "Timetable Change"
        verbose_name_plural = "Timetable Changes"
        ordering = ["-created_at"]

    def clean(self):
        super().clean()
        if self.change_type and self.change_type not in self.ChangeType.values:
            raise ValidationError(
                {
                    "change_type": f"Loại thay đổi không hợp lệ. Chọn một trong: {', '.join(self.ChangeType.values)}."
                }
            )
        if self.status and self.status not in self.ChangeStatus.values:
            raise ValidationError(
                {
                    "status": f"Trạng thái không hợp lệ. Chọn một trong: {', '.join(self.ChangeStatus.values)}."
                }
            )

    def __str__(self) -> str:
        return f"{self.timetable} - {self.get_change_type_display()} on {self.change_date}"

    def __repr__(self) -> str:
        return f"<TimetableChange {self.pk}>"
