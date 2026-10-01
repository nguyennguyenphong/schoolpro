from django.db import models

from common.models.base import UUIDModel


class Department(UUIDModel):
    """
    Department Model.

    Database Table: "core"."departments"
    Description: Master educational subject departments and administrative divisions
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="departments",
        db_comment="school_id foreign key",
    )
    code = models.CharField(
        max_length=30,
    )
    name = models.CharField(
        max_length=150,
    )
    department_type = models.CharField(
        max_length=30,
    )
    leader_teacher = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="leader_teacher_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="leader_teacher_id foreign key",
    )
    vice_leader = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="vice_leader_id",
        related_name="+",
        null=True,
        blank=True,
        db_comment="vice_leader_id foreign key",
    )
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"core"."departments"'
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Department {self.pk}>"
