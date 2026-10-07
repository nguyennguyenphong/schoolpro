from django.db import models

from common.models.base import UUIDModel


class Grade(UUIDModel):
    """
    Grade Model.

    Database Table: "core"."grades"
    Description: Master high school grade tiers (Grade 10, 11, 12) and assigned grade supervisor
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="grades",
        db_comment="school_id foreign key",
    )
    code = models.CharField(max_length=60, blank=True)
    name = models.CharField(max_length=50)
    order_no = models.SmallIntegerField(default=0)
    supervisor = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="supervisor_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="supervisor_id foreign key",
    )
    head_teacher = models.ForeignKey(
        "core.User",
        on_delete=models.SET_NULL,
        db_column="head_teacher_id",
        null=True,
        blank=True,
        related_name="+",
        db_comment="head_teacher_id foreign key",
    )
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"core"."grades"'
        verbose_name = "Grade Level"
        verbose_name_plural = "Grade Levels"
        ordering = ["order_no"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Grade {self.code}: {self.name}>"
