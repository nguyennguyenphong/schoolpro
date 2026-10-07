from django.db import models

from common.models.base import UUIDModel


class Club(UUIDModel):
    """
    Club Model.

    Database Table: "core"."clubs"
    Description: Extracurricular student clubs, sports teams, and volunteer societies
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="clubs",
        db_comment="school_id foreign key",
    )
    code = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=30, default="ACADEMIC")
    advisor_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="advisor_teacher_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="advisor_teacher_id foreign key",
    )
    president_student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="president_student_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="president_student_id foreign key",
    )
    vice_president_student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="vice_president_student_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="vice_president_student_id foreign key",
    )
    meeting_schedule = models.CharField(max_length=255, null=True, blank=True)
    meeting_location = models.CharField(max_length=255, null=True, blank=True)
    membership_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_members = models.SmallIntegerField(null=True, blank=True)
    social_media_link = models.CharField(max_length=500, null=True, blank=True)
    cover_image_url = models.TextField(null=True, blank=True)
    logo_url = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    established_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."clubs"'
        verbose_name = "Extracurricular Club"
        verbose_name_plural = "Extracurricular Clubs"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Club {self.code}: {self.name}>"


class ClubMember(UUIDModel):
    """
    ClubMember Model.

    Database Table: "core"."club_members"
    Description: Roster of student club participants, leaders, and executive positions
    """

    club = models.ForeignKey(
        "core.Club",
        on_delete=models.CASCADE,
        db_column="club_id",
        related_name="members",
        db_comment="club_id foreign key",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="club_memberships",
        db_comment="student_id foreign key",
    )
    role_title = models.CharField(max_length=50, default="MEMBER")
    joined_date = models.DateField()
    left_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default="ACTIVE")
    leave_reason = models.TextField(null=True, blank=True)
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    merit_points = models.SmallIntegerField(default=0)
    certificate_issued = models.BooleanField(default=False)
    contribution_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."club_members"'
        verbose_name = "Club Member"
        verbose_name_plural = "Club Members"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ClubMember ({self.pk})"

    def __repr__(self) -> str:
        return f"<ClubMember {self.pk}>"
