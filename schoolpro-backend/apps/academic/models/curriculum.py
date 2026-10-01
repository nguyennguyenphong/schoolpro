from django.db import models

from common.models.base import UUIDModel


class CurriculumTrack(UUIDModel):
    """
    CurriculumTrack Model.

    Database Table: "academic"."curriculum_tracks"
    Description: Elective subject tracks and career orientation clusters under GDPT 2018 curriculum
    """

    school_id = models.UUIDField()
    grade_id = models.UUIDField()
    code = models.CharField(
        max_length=50,
    )
    name = models.CharField(
        max_length=255,
    )
    career_orientation = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."curriculum_tracks"'
        verbose_name = "Curriculum Track"
        verbose_name_plural = "Curriculum Tracks"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<CurriculumTrack {self.pk}>"


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
        related_name="+",
        db_comment="track_id foreign key",
    )
    subject_id = models.UUIDField()
    is_track_core = models.BooleanField(default=False)
    credit_periods_per_year = models.SmallIntegerField()
    study_cluster_topic = models.CharField(max_length=150, null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."curriculum_track_subjects"'
        verbose_name = "Curriculum Track Subject"
        verbose_name_plural = "Curriculum Track Subjects"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"CurriculumTrackSubject ({self.pk})"

    def __repr__(self) -> str:
        return f"<CurriculumTrackSubject {self.pk}>"


class StudentTrackEnrollment(UUIDModel):
    """
    StudentTrackEnrollment Model.

    Database Table: "academic"."student_track_enrollments"
    Description: Annual student subject combination and career track assignment
    """

    student_id = models.UUIDField()
    track = models.ForeignKey(
        "academic.CurriculumTrack",
        on_delete=models.CASCADE,
        db_column="track_id",
        related_name="+",
        db_comment="track_id foreign key",
    )
    academic_year_id = models.UUIDField()
    enrolled_date = models.DateField()
    status = models.CharField(
        max_length=20,
    )
    change_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."student_track_enrollments"'
        verbose_name = "Student Track Enrollment"
        verbose_name_plural = "Student Track Enrollments"
        ordering = ["-enrolled_at"]

    def __str__(self) -> str:
        return f"StudentTrackEnrollment ({self.pk})"

    def __repr__(self) -> str:
        return f"<StudentTrackEnrollment {self.pk}>"
