from django.db import models

from common.models.base import UUIDModel


class FeeItem(UUIDModel):
    """
    FeeItem Model.

    Database Table: "academic"."fee_items"
    Description: Master fee schedule for tuition and statutory student fees
    """

    school_id = models.UUIDField()
    academic_year_id = models.UUIDField()
    semester_id = models.UUIDField(null=True, blank=True)
    grade_id = models.UUIDField(null=True, blank=True)
    code = models.CharField(
        max_length=50,
    )
    name = models.CharField(
        max_length=255,
    )
    category = models.CharField(
        max_length=30,
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    is_mandatory = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."fee_items"'
        verbose_name = "Fee Item"
        verbose_name_plural = "Fee Items"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<FeeItem {self.pk}>"


class StudentFeeBill(UUIDModel):
    """
    StudentFeeBill Model.

    Database Table: "academic"."student_fee_bills"
    Description: Student fee accounts, payment reconciliation records, and social welfare subsidies
    """

    student_id = models.UUIDField()
    fee_item = models.ForeignKey(
        "academic.FeeItem",
        on_delete=models.CASCADE,
        db_column="fee_item_id",
        related_name="+",
        db_comment="fee_item_id foreign key",
    )
    bill_code = models.CharField(
        max_length=60,
    )
    original_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    waiver_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )
    waiver_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    waiver_reason = models.CharField(max_length=255, null=True, blank=True)
    final_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    payment_status = models.CharField(
        max_length=20,
    )
    payment_method = models.CharField(max_length=30, null=True, blank=True)
    transaction_ref = models.CharField(max_length=100, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    cashier_user_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."student_fee_bills"'
        verbose_name = "Student Fee Bill"
        verbose_name_plural = "Student Fee Bills"
        ordering = ["-bill_date"]

    def __str__(self) -> str:
        return f"StudentFeeBill ({self.pk})"

    def __repr__(self) -> str:
        return f"<StudentFeeBill {self.pk}>"
