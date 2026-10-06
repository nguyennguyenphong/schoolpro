from django.db import models

from common.models.base import UUIDModel


class FeeItem(UUIDModel):
    """
    FeeItem Model.

    Database Table: "academic"."fee_items"
    Description: Master fee schedule for tuition and statutory student fees
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="fee_items",
    )
    academic_year = models.ForeignKey(
        "master.AcademicYear",
        on_delete=models.CASCADE,
        db_column="academic_year_id",
        related_name="+",
    )
    semester = models.ForeignKey(
        "master.Semester",
        on_delete=models.SET_NULL,
        db_column="semester_id",
        null=True,
        blank=True,
        related_name="+",
    )
    grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.SET_NULL,
        db_column="grade_id",
        null=True,
        blank=True,
        related_name="+",
    )
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=30)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_mandatory = models.BooleanField(default=True)
    allow_installment = models.BooleanField(default=False)
    max_installments = models.SmallIntegerField(default=1)
    early_discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    early_discount_deadline = models.DateField(null=True, blank=True)
    late_fee_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    target_classes = models.ForeignKey(
        "core.SchoolClass",
        on_delete=models.SET_NULL,
        db_column="target_classes",
        null=True,
        blank=True,
        related_name="+",
    )
    bank_account_info = models.JSONField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."fee_items"'
        verbose_name = "Fee Item"
        verbose_name_plural = "Fee Items"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<FeeItem {self.code}: {self.name}>"


class StudentFeeBill(UUIDModel):
    """
    StudentFeeBill Model.

    Database Table: "academic"."student_fee_bills"
    Description: Student fee accounts, payment reconciliation records, and social welfare subsidies
    """

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        db_column="student_id",
        related_name="fee_bills",
        db_comment="student_id foreign key",
    )
    fee_item = models.ForeignKey(
        "academic.FeeItem",
        on_delete=models.CASCADE,
        db_column="fee_item_id",
        related_name="bills",
        db_comment="fee_item_id foreign key",
    )
    bill_code = models.CharField(max_length=60)
    original_amount = models.DecimalField(max_digits=12, decimal_places=2)
    waiver_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    waiver_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    waiver_reason = models.CharField(max_length=255, null=True, blank=True)
    final_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=20, default="UNPAID")
    payment_method = models.CharField(max_length=30, null=True, blank=True)
    payment_gateway = models.CharField(max_length=50, null=True, blank=True)
    qr_payment_url = models.TextField(null=True, blank=True)
    invoice_number = models.CharField(max_length=100, null=True, blank=True)
    invoice_url = models.TextField(null=True, blank=True)
    installment_order = models.SmallIntegerField(default=1)
    payer_name = models.CharField(max_length=150, null=True, blank=True)
    payer_phone = models.CharField(max_length=20, null=True, blank=True)
    transaction_ref = models.CharField(max_length=100, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    cashier_user = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="cashier_user_id",
        null=True,
        blank=True,
        related_name="+",
    )
    billing_notes = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."student_fee_bills"'
        verbose_name = "Student Fee Bill"
        verbose_name_plural = "Student Fee Bills"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Bill {self.bill_code} ({self.student_id}: {self.final_amount} VND)"

    def __repr__(self) -> str:
        return f"<StudentFeeBill {self.bill_code}>"
