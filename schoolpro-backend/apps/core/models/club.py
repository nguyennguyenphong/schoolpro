import uuid

from django.db import models


class Club(models.Model):
    """
    Club Model.

    Database Table: "core"."clubs"
    Description: Extracurricular student clubs, sports teams, and volunteer societies
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="+",
        db_comment="school_id foreign key",
    )
    code = models.CharField(
        max_length=50,
    )
    name = models.CharField(
        max_length=150,
    )
    category = models.CharField(
        max_length=30,
    )
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
    description = models.TextField(null=True, blank=True)
    logo_url = models.TextField(null=True, blank=True)
    established_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."clubs"'
        verbose_name = "Extracurricular Club"
        verbose_name_plural = "Extracurricular Clubs"

    def __str__(self) -> str:
        return str(self.name)


class ClubMember(models.Model):
    """
    ClubMember Model.

    Database Table: "core"."club_members"
    Description: Roster of student club participants, leaders, and executive positions
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    club = models.ForeignKey(
        "core.Club",
        on_delete=models.CASCADE,
        db_column="club_id",
        related_name="+",
        db_comment="club_id foreign key",
    )
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="+",
        db_comment="student_id foreign key",
    )
    role_title = models.CharField(
        max_length=50,
    )
    joined_date = models.DateField()
    status = models.CharField(
        max_length=20,
    )
    contribution_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."club_members"'
        verbose_name = "Club Member"
        verbose_name_plural = "Club Members"

    def __str__(self) -> str:
        return f"ClubMember ({self.pk})"
