import uuid
from django.db import models


class SchoolClass(models.Model):
    """
    SchoolClass Model.

    Database Table: "core"."classes"
    Description: Annual high school class rooms grouped by grade level and academic track
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="+",
        db_comment="academic_year_id foreign key",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.CASCADE,
        db_column="grade_id",
        related_name="+",
        db_comment="grade_id foreign key",
    )
    code = models.CharField(max_length=20, )
    name = models.CharField(max_length=100, )
    room_name = models.CharField(max_length=50, null=True, blank=True)
    class_stream_code = models.CharField(max_length=30, null=True, blank=True)
    max_students = models.SmallIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."classes"'
        verbose_name = "Class"
        verbose_name_plural = "Classs"

    def __str__(self) -> str:
        return str(self.name)


class ClassGroup(models.Model):
    """
    ClassGroup Model.

    Database Table: "core"."class_groups"
    Description: Class internal squads/teams (Tổ học tập & trực nhật) for granular emulation
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="+",
        db_comment="class_id foreign key",
    )
    code = models.CharField(max_length=20, )
    name = models.CharField(max_length=100, )
    order_no = models.SmallIntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"core"."class_groups"'
        verbose_name = "Class Group"
        verbose_name_plural = "Class Groups"

    def __str__(self) -> str:
        return str(self.name)


class StudentClassEnrollment(models.Model):
    """
    StudentClassEnrollment Model.

    Database Table: "core"."student_class_enrollments"
    Description: Annual official class roster memberships and internal squad placements
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="+",
        db_comment="student_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="+",
        db_comment="class_id foreign key",
    )
    class_group = models.ForeignKey(
        "core.ClassGroup",
        on_delete=models.SET_NULL,
        db_column="class_group_id",
        related_name="+",
        null=True, blank=True, db_comment="class_group_id foreign key",
    )
    enroll_date = models.DateField()
    leave_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, )

    class Meta:
        managed = False
        db_table = '"core"."student_class_enrollments"'
        verbose_name = "Student Class Enrollment"
        verbose_name_plural = "Student Class Enrollments"

    def __str__(self) -> str:
        return f"StudentClassEnrollment ({self.pk})"


class ClassSubjectTeacher(models.Model):
    """
    ClassSubjectTeacher Model.

    Database Table: "core"."class_subject_teachers"
    Description: Semester teaching assignments linking teachers to specific subject classes
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="+",
        db_comment="class_id foreign key",
    )
    subject = models.ForeignKey(
        "master.Subject",
        on_delete=models.CASCADE,
        db_column="subject_id",
        related_name="+",
        db_comment="subject_id foreign key",
    )
    teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.CASCADE,
        db_column="teacher_id",
        related_name="+",
        db_comment="teacher_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        related_name="+",
        db_comment="semester_id foreign key",
    )
    periods_per_week = models.SmallIntegerField()
    notes = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"core"."class_subject_teachers"'
        verbose_name = "Class Subject Teacher Assignment"
        verbose_name_plural = "Class Subject Teacher Assignments"

    def __str__(self) -> str:
        return f"ClassSubjectTeacher ({self.pk})"


class PositionAssignment(models.Model):
    """
    PositionAssignment Model.

    Database Table: "core"."position_assignments"
    Description: Temporal polymorphic history of positions held by users in classes, groups, departments, or grades
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="+",
        db_comment="user_id foreign key",
    )
    position = models.ForeignKey(
        "master.Position",
        on_delete=models.CASCADE,
        db_column="position_id",
        related_name="+",
        db_comment="position_id foreign key",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="+",
        db_comment="academic_year_id foreign key",
    )
    scope_type = models.CharField(max_length=50, )
    school = models.ForeignKey(
        "master.School",
        on_delete=models.SET_NULL,
        db_column="school_id",
        related_name="+",
        null=True, blank=True, db_comment="school_id foreign key",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.SET_NULL,
        db_column="grade_id",
        related_name="+",
        null=True, blank=True, db_comment="grade_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.SET_NULL,
        db_column="class_id",
        related_name="+",
        null=True, blank=True, db_comment="class_id foreign key",
    )
    class_group = models.ForeignKey(
        "core.ClassGroup",
        on_delete=models.SET_NULL,
        db_column="class_group_id",
        related_name="+",
        null=True, blank=True, db_comment="class_group_id foreign key",
    )
    department = models.ForeignKey(
        "master.Department",
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="+",
        null=True, blank=True, db_comment="department_id foreign key",
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    note = models.TextField(null=True, blank=True)
    created_by_rel = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="created_by",
        related_name="+",
        null=True, blank=True, db_comment="created_by foreign key",
    )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."position_assignments"'
        verbose_name = "Position Assignment"
        verbose_name_plural = "Position Assignments"

    def __str__(self) -> str:
        return f"PositionAssignment ({self.pk})"
