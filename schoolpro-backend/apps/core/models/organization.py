from django.db import models

from common.models.base import UUIDModel


class SchoolClass(UUIDModel):
    """
    SchoolClass Model.

    Database Table: "core"."classes"
    Description: Annual high school class rooms grouped by grade level and academic track
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="classes",
        db_comment="school_id foreign key",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="classes",
        db_comment="academic_year_id foreign key",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.CASCADE,
        db_column="grade_id",
        related_name="classes",
        db_comment="grade_id foreign key",
    )
    code = models.CharField(max_length=60, blank=True)
    name = models.CharField(max_length=100)
    homeroom_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="homeroom_teacher_id",
        null=True,
        blank=True,
        related_name="homeroom_classes",
        db_comment="homeroom_teacher_id foreign key",
    )
    assistant_homeroom_teacher = models.ForeignKey(
        "core.Teacher",
        on_delete=models.SET_NULL,
        db_column="assistant_homeroom_teacher_id",
        null=True,
        blank=True,
        related_name="assistant_homeroom_classes",
        db_comment="assistant_homeroom_teacher_id foreign key",
    )
    monitor_student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="monitor_student_id",
        null=True,
        blank=True,
        related_name="monitor_classes",
        db_comment="monitor_student_id foreign key",
    )
    vice_monitor_student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="vice_monitor_student_id",
        null=True,
        blank=True,
        related_name="vice_monitor_classes",
        db_comment="vice_monitor_student_id foreign key",
    )
    curriculum_track = models.ForeignKey(
        "academic.CurriculumTrack",
        on_delete=models.SET_NULL,
        db_column="curriculum_track_id",
        null=True,
        blank=True,
        related_name="classes",
        db_comment="curriculum_track_id foreign key",
    )
    shift = models.CharField(max_length=20, default="MORNING")
    room = models.ForeignKey(
        "academic.Room",
        on_delete=models.SET_NULL,
        db_column="room_id",
        null=True,
        blank=True,
        related_name="classes",
        db_comment="room_id foreign key",
    )
    room_name = models.CharField(max_length=50, null=True, blank=True)
    class_stream_code = models.CharField(max_length=60, default="KHTN", null=True, blank=True)
    max_students = models.SmallIntegerField(default=45, null=True, blank=True)
    slogan = models.CharField(max_length=255, null=True, blank=True)
    avatar_url = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."classes"'
        verbose_name = "Class"
        verbose_name_plural = "Classes"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<SchoolClass {self.code}: {self.name}>"


class ClassGroup(UUIDModel):
    """
    ClassGroup Model.

    Database Table: "core"."class_groups"
    Description: Class internal squads/teams (Tổ học tập & trực nhật) for granular emulation
    """

    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="groups",
        db_comment="class_id foreign key",
    )
    code = models.CharField(max_length=60, blank=True)
    name = models.CharField(max_length=100)
    leader_student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="leader_student_id",
        null=True,
        blank=True,
        related_name="led_groups",
        db_comment="leader_student_id foreign key",
    )
    deputy_leader_student = models.ForeignKey(
        "core.Student",
        on_delete=models.SET_NULL,
        db_column="deputy_leader_student_id",
        null=True,
        blank=True,
        related_name="deputy_led_groups",
        db_comment="deputy_leader_student_id foreign key",
    )
    order_no = models.SmallIntegerField(default=1, null=True, blank=True)
    color_tag = models.CharField(max_length=30, default="blue", null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."class_groups"'
        verbose_name = "Class Group"
        verbose_name_plural = "Class Groups"
        ordering = ["order_no"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<ClassGroup {self.code}: {self.name}>"


class StudentClassEnrollment(UUIDModel):
    """
    StudentClassEnrollment Model.

    Database Table: "core"."student_class_enrollments"
    Description: Annual official class roster memberships and internal squad placements
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="enrollments",
        db_comment="student_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="enrollments",
        db_comment="class_id foreign key",
    )
    class_group = models.ForeignKey(
        "core.ClassGroup",
        on_delete=models.SET_NULL,
        db_column="class_group_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="class_group_id foreign key",
    )
    seat_number = models.SmallIntegerField(null=True, blank=True)
    desk_row = models.SmallIntegerField(null=True, blank=True)
    desk_column = models.SmallIntegerField(null=True, blank=True)
    enroll_date = models.DateField()
    leave_date = models.DateField(null=True, blank=True)
    leave_reason = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default="ACTIVE")
    enrolled_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="enrolled_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="enrolled_by foreign key",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."student_class_enrollments"'
        verbose_name = "Student Class Enrollment"
        verbose_name_plural = "Student Class Enrollments"

    def __str__(self) -> str:
        return f"StudentClassEnrollment ({self.pk})"

    def __repr__(self) -> str:
        return f"<StudentClassEnrollment {self.pk}>"


class ClassSubjectTeacher(UUIDModel):
    """
    ClassSubjectTeacher Model.

    Database Table: "core"."class_subject_teachers"
    Description: Semester teaching assignments linking teachers to specific subject classes
    """

    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.CASCADE,
        db_column="class_id",
        related_name="subject_teachers",
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
        related_name="teaching_assignments",
        db_comment="teacher_id foreign key",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.CASCADE,
        db_column="semester_id",
        related_name="+",
        db_comment="semester_id foreign key",
    )
    periods_per_week = models.SmallIntegerField(default=3)
    is_primary_teacher = models.BooleanField(default=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default="ACTIVE")
    notes = models.TextField(null=True, blank=True)
    assigned_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="assigned_by",
        null=True,
        blank=True,
        related_name="+",
        db_comment="assigned_by foreign key",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."class_subject_teachers"'
        verbose_name = "Class Subject Teacher Assignment"
        verbose_name_plural = "Class Subject Teacher Assignments"

    def __str__(self) -> str:
        return f"ClassSubjectTeacher ({self.pk})"

    def __repr__(self) -> str:
        return f"<ClassSubjectTeacher {self.pk}>"


class PositionAssignment(UUIDModel):
    """
    PositionAssignment Model.

    Database Table: "core"."position_assignments"
    Description: Temporal polymorphic history of positions held by users in classes, groups, departments, or grades
    """

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
    scope_type = models.CharField(max_length=50)
    school = models.ForeignKey(
        "master.School",
        on_delete=models.SET_NULL,
        db_column="school_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="school_id foreign key",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.SET_NULL,
        db_column="grade_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="grade_id foreign key",
    )
    school_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.SET_NULL,
        db_column="class_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="class_id foreign key",
    )
    class_group = models.ForeignKey(
        "core.ClassGroup",
        on_delete=models.SET_NULL,
        db_column="class_group_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="class_group_id foreign key",
    )
    department = models.ForeignKey(
        "master.Department",
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="department_id foreign key",
    )
    appointment_decision_number = models.CharField(max_length=100, null=True, blank=True)
    allowance_coefficient = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=True)
    note = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="created_by",
        related_name="+",
        null=True,
        blank=True,
        db_comment="created_by foreign key",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."position_assignments"'
        verbose_name = "Position Assignment"
        verbose_name_plural = "Position Assignments"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"PositionAssignment ({self.pk})"

    def __repr__(self) -> str:
        return f"<PositionAssignment {self.pk}>"
