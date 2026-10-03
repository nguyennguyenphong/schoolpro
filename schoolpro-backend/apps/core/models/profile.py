from django.db import models

from common.models.base import UUIDModel


class Teacher(UUIDModel):
    """
    Teacher Model.

    Database Table: "core"."teachers"
    Description: Academic teaching staff profiles and department assignments
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="teacher_profile",
        db_comment="user_id foreign key",
    )
    teacher_code = models.CharField(
        max_length=30,
    )
    department = models.ForeignKey(
        "master.Department",
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="teachers",
        null=True,
        blank=True,
        db_comment="department_id foreign key",
    )
    qualification = models.CharField(max_length=100, null=True, blank=True)
    subject_major = models.CharField(
        max_length=150,
    )
    hire_date = models.DateField()
    status = models.CharField(
        max_length=20,
    )
    is_homeroom = models.BooleanField(default=False)
    employment_type = models.CharField(max_length=30, default="FULL_TIME")
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."teachers"'
        verbose_name = "Teacher Profile"
        verbose_name_plural = "Teacher Profiles"
        ordering = ["-created_at"]

    @property
    def full_name(self) -> str:
        """Convenience accessor to related User full name."""
        return self.user.full_name if self.user else ""

    @property
    def email(self) -> str:
        """Convenience accessor to related User email."""
        return self.user.email if self.user else ""

    @property
    def phone(self) -> str:
        """Convenience accessor to related User phone."""
        return self.user.phone if self.user else ""

    def __str__(self) -> str:
        return f"{self.teacher_code} - {self.full_name}" if self.full_name else self.teacher_code

    def __repr__(self) -> str:
        return f"<Teacher {self.teacher_code}: {self.full_name}>"


class Student(UUIDModel):
    """
    Student Model.

    Database Table: "core"."students"
    Description: Comprehensive student educational lifecycle dossier
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="student_profile",
        db_comment="user_id foreign key",
    )
    student_code = models.CharField(
        max_length=30,
    )
    admission_date = models.DateField()
    graduation_date = models.DateField(null=True, blank=True)
    ethnicity = models.CharField(max_length=50, null=True, blank=True)
    religion = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(
        max_length=20,
    )
    current_class = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.SET_NULL,
        db_column="current_class_id",
        related_name="current_students",
        null=True,
        blank=True,
        db_comment="current_class_id foreign key",
    )
    birth_place = models.CharField(max_length=100, null=True, blank=True)
    is_boarder = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."students"'
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"
        ordering = ["-created_at"]

    @property
    def full_name(self) -> str:
        """Convenience accessor to related User full name."""
        return self.user.full_name if self.user else ""

    @property
    def email(self) -> str:
        """Convenience accessor to related User email."""
        return self.user.email if self.user else ""

    @property
    def phone(self) -> str:
        """Convenience accessor to related User phone."""
        return self.user.phone if self.user else ""

    def __str__(self) -> str:
        return f"{self.student_code} - {self.full_name}" if self.full_name else self.student_code

    def __repr__(self) -> str:
        return f"<Student {self.student_code}: {self.full_name}>"


class Staff(UUIDModel):
    """
    Staff Model.

    Database Table: "core"."staff"
    Description: Non-teaching administrative staff, supervisors, and auxiliary professionals
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="staff_profile",
        db_comment="user_id foreign key",
    )
    staff_code = models.CharField(
        max_length=30,
    )
    department = models.ForeignKey(
        "master.Department",
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="staff",
        null=True,
        blank=True,
        db_comment="department_id foreign key",
    )
    job_title = models.CharField(
        max_length=150,
    )
    hire_date = models.DateField()
    status = models.CharField(
        max_length=20,
    )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."staff"'
        verbose_name = "Staff Profile"
        verbose_name_plural = "Staff Profiles"
        ordering = ["-created_at"]

    @property
    def full_name(self) -> str:
        """Convenience accessor to related User full name."""
        return self.user.full_name if self.user else ""

    @property
    def email(self) -> str:
        """Convenience accessor to related User email."""
        return self.user.email if self.user else ""

    def __str__(self) -> str:
        return f"{self.staff_code} - {self.full_name}" if self.full_name else self.staff_code

    def __repr__(self) -> str:
        return f"<Staff {self.staff_code}: {self.full_name}>"


class Guardian(UUIDModel):
    """
    Guardian Model.

    Database Table: "core"."guardians"
    Description: Parent and guardian directory for home-school omnichannel communications
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="guardians",
        db_comment="student_id foreign key",
    )
    user = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="user_id",
        related_name="guardian_profile",
        null=True,
        blank=True,
        db_comment="user_id foreign key",
    )
    full_name = models.CharField(
        max_length=255,
    )
    relationship = models.CharField(
        max_length=50,
    )
    phone = models.CharField(
        max_length=20,
    )
    email = models.CharField(max_length=255, null=True, blank=True)
    job = models.CharField(max_length=150, null=True, blank=True)
    is_primary_contact = models.BooleanField(default=False)
    is_parent_committee = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = '"core"."guardians"'
        verbose_name = "Guardian Profile"
        verbose_name_plural = "Guardian Profiles"

    def __str__(self) -> str:
        return str(self.full_name)

    def __repr__(self) -> str:
        return f"<Guardian {self.pk}>"


class StudentHealthRecord(UUIDModel):
    """
    StudentHealthRecord Model.

    Database Table: "core"."student_health_records"
    Description: Campus medical clinic records and physical growth tracking per student
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="health_records",
        db_comment="student_id foreign key",
    )
    height_cm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_type = models.CharField(max_length=10, null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    chronic_illness = models.TextField(null=True, blank=True)
    vision_left = models.CharField(max_length=10, null=True, blank=True)
    vision_right = models.CharField(max_length=10, null=True, blank=True)
    insurance_code = models.CharField(max_length=50, null=True, blank=True)
    last_checkup_at = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."student_health_records"'
        verbose_name = "Student Health Record"
        verbose_name_plural = "Student Health Records"

    def __str__(self) -> str:
        return f"StudentHealthRecord ({self.pk})"

    def __repr__(self) -> str:
        return f"<StudentHealthRecord {self.pk}>"
