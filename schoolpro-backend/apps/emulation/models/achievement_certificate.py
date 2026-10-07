from django.db import models

from common.models.base import UUIDModel


class AchievementCertificate(UUIDModel):
    """
    AchievementCertificate Model.

    Database Table: "emulation"."achievement_certificates"
    Description: Comprehensive institutional Hall of Fame & Achievement Certificates
    showcasing honors, awards, and certifications for students, teachers, staff,
    classes, grades, and the entire school.
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="achievement_certificates",
        db_comment="school_id foreign key",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.SET_NULL,
        db_column="academic_year_id",
        related_name="achievement_certificates",
        null=True,
        blank=True,
        db_comment="academic_year_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.SET_NULL,
        db_column="semester_id",
        related_name="achievement_certificates",
        null=True,
        blank=True,
        db_comment="semester_id foreign key",
    )

    # Recipient / Holder Scope (Individual or Collective)
    recipient_type = models.CharField(
        max_length=20,
        default="STUDENT",
        help_text="Target entity: STUDENT, TEACHER, STAFF, CLASS, GRADE, SCHOOL, COLLECTIVE, INDIVIDUAL",
    )
    recipient_name = models.CharField(
        max_length=255,
        help_text="Name of the honored individual or collective entity",
    )
    user = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="user_id",
        related_name="achievement_certificates",
        null=True,
        blank=True,
        db_comment="user_id foreign key",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="student_id",
        related_name="achievement_certificates",
        null=True,
        blank=True,
        db_comment="student_id foreign key",
    )
    teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="teacher_id",
        related_name="achievement_certificates",
        null=True,
        blank=True,
        db_comment="teacher_id foreign key",
    )
    staff = models.ForeignKey(
        "core.Staff",
        on_delete=models.SET_NULL,
        db_column="staff_id",
        related_name="achievement_certificates",
        null=True,
        blank=True,
        db_comment="staff_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.SET_NULL,
        db_column="class_id",
        related_name="achievement_certificates",
        null=True,
        blank=True,
        db_comment="class_id foreign key",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.SET_NULL,
        db_column="grade_id",
        related_name="achievement_certificates",
        null=True,
        blank=True,
        db_comment="grade_id foreign key",
    )

    # Category of Achievement / Certification
    category = models.CharField(
        max_length=50,
        default="ACADEMIC",
        help_text="Category of achievement / qualification",
    )
    title = models.CharField(
        max_length=255,
        help_text="Title of the accolade or certificate name",
    )
    certificate_code = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Certificate or credential identifier number",
    )
    decision_number = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Official commendation decree / decision reference number",
    )
    decision_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date when decision was ratified",
    )
    issuing_organization = models.CharField(
        max_length=255,
        help_text="Authority / Organization granting the honor or certificate",
    )
    issue_date = models.DateField(
        help_text="Issue / Conferral date",
    )
    expiry_date = models.DateField(
        null=True,
        blank=True,
        help_text="Expiry date if applicable",
    )
    level = models.CharField(
        max_length=30,
        default="SCHOOL",
        help_text="Jurisdiction level: CLASS, SCHOOL, DISTRICT, PROVINCIAL, MINISTERIAL, NATIONAL, INTERNATIONAL",
    )
    prize_or_rank = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Prize tier, rank, band or grade (e.g. First Prize, Band 8.0, Gold Medal)",
    )
    score_details = models.JSONField(
        default=dict,
        blank=True,
        help_text="Detailed performance breakdown per module or skill",
    )
    summary = models.TextField(
        null=True,
        blank=True,
        help_text="Achievement citation, summary of merit, or laudatory description",
    )
    certificate_file_url = models.TextField(
        null=True,
        blank=True,
        help_text="URL to certificate scan or digital document",
    )
    badge_icon_url = models.TextField(
        null=True,
        blank=True,
        help_text="Icon badge / medal / trophy graphic for Hall of Fame display",
    )
    verification_url = models.TextField(
        null=True,
        blank=True,
        help_text="Direct link for online verification lookup",
    )
    verification_code = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Verification PIN / security code",
    )

    # Public Showcase & Hall of Fame Controls
    is_public = models.BooleanField(
        default=True,
        help_text="Public visibility flag allowing all users/visitors to view on achievement board",
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Spotlight flag pinning this accolade on the home Hall of Fame showcase",
    )
    display_order = models.SmallIntegerField(
        default=0,
        help_text="Display priority order",
    )
    views_count = models.IntegerField(
        default=0,
        help_text="Number of showcase views",
    )

    # Verification Workflow
    status = models.CharField(
        max_length=20,
        default="APPROVED",
        help_text="Verification status: PENDING, APPROVED, REJECTED, EXPIRED",
    )
    verified_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="verified_by",
        related_name="verified_achievement_certificates",
        null=True,
        blank=True,
        db_comment="verified_by foreign key",
    )
    verified_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when verified",
    )
    rejection_reason = models.TextField(
        null=True,
        blank=True,
        help_text="Rejection justification if invalid",
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Flexible metadata attributes",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"emulation"."achievement_certificates"'
        verbose_name = "Achievement Certificate"
        verbose_name_plural = "Achievement Certificates"
        ordering = ["-is_featured", "display_order", "-issue_date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.title} - {self.recipient_name} ({self.prize_or_rank or self.category})"

    def __repr__(self) -> str:
        return f"<AchievementCertificate {self.pk}: {self.title} - {self.recipient_name}>"
