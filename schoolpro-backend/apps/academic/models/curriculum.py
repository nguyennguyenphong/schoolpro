from django.db import models

from common.models.base import UUIDModel


class CurriculumTrack(UUIDModel):
    """
    CurriculumTrack Model.

    Database Table: "academic"."curriculum_tracks"
    Description: Elective subject tracks and career orientation clusters under GDPT 2018 curriculum
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="curriculum_tracks",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.CASCADE,
        db_column="grade_id",
        related_name="curriculum_tracks",
    )
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    career_orientation = models.CharField(max_length=100, null=True, blank=True)
    quota_students = models.SmallIntegerField(null=True, blank=True)
    admission_criteria = models.TextField(null=True, blank=True)
    color_tag = models.CharField(max_length=30, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."curriculum_tracks"'
        verbose_name = "Curriculum Track"
        verbose_name_plural = "Curriculum Tracks"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<CurriculumTrack {self.code}: {self.name}>"


class CurriculumTrackSubject(UUIDModel):
    """
    CurriculumTrackSubject Model.

    Database Table: "academic"."curriculum_track_subjects"
    Description: Subject composition and specialized learning clusters per academic track
    """

    track = models.ForeignKey(
        "academic.CurriculumTrack",
        on_delete=models.CASCADE,
        db_column="track_id",
        related_name="track_subjects",
        db_comment="track_id foreign key",
    )
    subject = models.ForeignKey(
        "master.Subject",
        on_delete=models.CASCADE,
        db_column="subject_id",
        related_name="+",
    )
    is_compulsory = models.BooleanField(default=True)
    is_track_core = models.BooleanField(default=False)
    credit_periods_per_year = models.SmallIntegerField(default=70)
    cluster_period_count = models.SmallIntegerField(default=35)
    study_cluster_topic = models.CharField(max_length=150, null=True, blank=True)
    syllabus_description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."curriculum_track_subjects"'
        verbose_name = "Curriculum Track Subject"
        verbose_name_plural = "Curriculum Track Subjects"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"TrackSubject ({self.track_id} - {self.subject_id})"


class StudentTrackEnrollment(UUIDModel):
    """
    StudentTrackEnrollment Model.

    Database Table: "academic"."student_track_enrollments"
    Description: Annual student subject combination and career track assignment
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="track_enrollments",
        db_comment="student_id foreign key",
    )
    track = models.ForeignKey(
        "academic.CurriculumTrack",
        on_delete=models.CASCADE,
        db_column="track_id",
        related_name="enrolled_students",
        db_comment="track_id foreign key",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="+",
    )
    registered_cluster_subjects = models.JSONField(null=True, blank=True)
    enrolled_date = models.DateField()
    parent_consent = models.BooleanField(default=True)
    parent_consent_document_url = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default="ACTIVE")
    change_reason = models.TextField(null=True, blank=True)
    approved_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="approved_by",
        null=True,
        blank=True,
        related_name="+",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."student_track_enrollments"'
        verbose_name = "Student Track Enrollment"
        verbose_name_plural = "Student Track Enrollments"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"TrackEnrollment ({self.student_id} in {self.track_id})"
