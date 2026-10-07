from django.db import models

from common.models.base import UUIDModel


class Teacher(UUIDModel):
    """
    Teacher Model.

    Database Table: "core"."teachers"
    Description: Academic teaching staff profiles, credentials, tax, and employment dossier
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="teacher_profile",
        db_comment="user_id foreign key",
    )
    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="teachers",
        db_comment="school_id foreign key",
    )
    teacher_code = models.CharField(max_length=60, unique=True, blank=True)
    department = models.ForeignKey(
        "master.Department",
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="teachers",
        null=True,
        blank=True,
        db_comment="department_id foreign key",
    )
    qualification = models.CharField(
        max_length=100, default="Cử nhân Sư phạm", null=True, blank=True
    )
    subject_major = models.CharField(max_length=150)
    national_id_number = models.CharField(max_length=20, null=True, blank=True)
    tax_code = models.CharField(max_length=60, null=True, blank=True)
    social_insurance_number = models.CharField(max_length=30, null=True, blank=True)
    academic_rank = models.CharField(max_length=50, null=True, blank=True)
    years_of_experience = models.SmallIntegerField(default=0, null=True, blank=True)
    teaching_certificate = models.CharField(max_length=200, null=True, blank=True)
    foreign_language_level = models.CharField(max_length=50, null=True, blank=True)
    it_level = models.CharField(max_length=50, null=True, blank=True)
    standard_weekly_periods = models.SmallIntegerField(default=17)
    salary_grade = models.CharField(max_length=20, null=True, blank=True)
    is_party_member = models.BooleanField(default=False)
    party_entry_date = models.DateField(null=True, blank=True)
    contract_number = models.CharField(max_length=50, null=True, blank=True)
    hire_date = models.DateField()
    contract_end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default="ACTIVE")
    is_homeroom = models.BooleanField(default=False)
    employment_type = models.CharField(max_length=30, default="FULL_TIME")
    biography = models.TextField(null=True, blank=True)
    custom_attributes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    Description: Comprehensive student educational lifecycle dossier conforming to MOET & VNeID digital standards
    """

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="user_id",
        related_name="student_profile",
        db_comment="user_id foreign key",
    )
    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="students",
        db_comment="school_id foreign key",
    )
    student_code = models.CharField(max_length=60, unique=True, blank=True)
    national_id_number = models.CharField(max_length=20, null=True, blank=True)
    national_id_issued_date = models.DateField(null=True, blank=True)
    national_id_issued_place = models.CharField(max_length=150, null=True, blank=True)
    admission_date = models.DateField()
    graduation_date = models.DateField(null=True, blank=True)
    ethnicity = models.CharField(max_length=50, default="Kinh", null=True, blank=True)
    religion = models.CharField(max_length=50, default="Không", null=True, blank=True)
    status = models.CharField(max_length=20, default="STUDYING")
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
    permanent_address = models.TextField(null=True, blank=True)
    temporary_address = models.TextField(null=True, blank=True)
    household_registration_number = models.CharField(max_length=50, null=True, blank=True)
    insurance_card_number = models.CharField(max_length=30, null=True, blank=True)
    policy_beneficiary = models.CharField(max_length=100, null=True, blank=True)
    blood_type = models.CharField(max_length=5, null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    is_boarder = models.BooleanField(default=False)
    is_pioneer = models.BooleanField(default=True)
    pioneer_entry_date = models.DateField(null=True, blank=True)
    is_union_member = models.BooleanField(default=False)
    union_entry_date = models.DateField(null=True, blank=True)
    special_notes = models.TextField(null=True, blank=True)
    custom_attributes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        null=True,
        blank=True,
        related_name="staff",
        db_comment="school_id foreign key",
    )
    staff_code = models.CharField(max_length=60, unique=True, blank=True)
    department = models.ForeignKey(
        "master.Department",
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="staff",
        null=True,
        blank=True,
        db_comment="department_id foreign key",
    )
    job_title = models.CharField(max_length=150)
    national_id_number = models.CharField(max_length=20, null=True, blank=True)
    tax_code = models.CharField(max_length=60, null=True, blank=True)
    social_insurance_number = models.CharField(max_length=30, null=True, blank=True)
    qualification = models.CharField(max_length=100, null=True, blank=True)
    employment_type = models.CharField(max_length=30, default="FULL_TIME")
    contract_number = models.CharField(max_length=50, null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    hire_date = models.DateField()
    status = models.CharField(max_length=20, default="ACTIVE")
    custom_attributes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    full_name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=50)
    national_id = models.CharField(max_length=30, null=True, blank=True)
    phone = models.CharField(max_length=20)
    email = models.CharField(max_length=255, null=True, blank=True)
    job = models.CharField(max_length=150, null=True, blank=True)
    workplace = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    is_primary_contact = models.BooleanField(default=False)
    is_emergency_contact = models.BooleanField(default=True)
    is_parent_committee = models.BooleanField(default=False)
    committee_role = models.CharField(max_length=50, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."guardians"'
        verbose_name = "Guardian Profile"
        verbose_name_plural = "Guardian Profiles"

    def __str__(self) -> str:
        return str(self.full_name)

    def __repr__(self) -> str:
        return f"<Guardian {self.pk}: {self.full_name}>"


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
    bmi = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    blood_type = models.CharField(max_length=10, null=True, blank=True)
    vision_left = models.CharField(max_length=10, null=True, blank=True)
    vision_right = models.CharField(max_length=10, null=True, blank=True)
    hearing_status = models.CharField(max_length=50, default="NORMAL", null=True, blank=True)
    dental_status = models.CharField(max_length=100, null=True, blank=True)
    skeletal_status = models.CharField(max_length=100, null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    chronic_illness = models.TextField(null=True, blank=True)
    health_classification = models.CharField(max_length=20, default="TYPE_1", null=True, blank=True)
    insurance_code = models.CharField(max_length=60, null=True, blank=True)
    examined_by_nurse = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="examined_by_nurse_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="examined_by_nurse_id foreign key",
    )
    last_checkup_at = models.DateField(null=True, blank=True)
    vaccination_records = models.JSONField(default=list, blank=True)
    special_care_instructions = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."student_health_records"'
        verbose_name = "Student Health Record"
        verbose_name_plural = "Student Health Records"

    def __str__(self) -> str:
        return f"StudentHealthRecord ({self.pk})"

    def __repr__(self) -> str:
        return f"<StudentHealthRecord {self.pk}>"
