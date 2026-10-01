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
    code = models.CharField(
        max_length=10,
    )
    name = models.CharField(
        max_length=50,
    )
    order_no = models.SmallIntegerField()
    supervisor_id = models.UUIDField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"core"."grades"'
        verbose_name = "Grade Level"
        verbose_name_plural = "Grade Levels"
        ordering = ["order_no"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Grade {self.pk}>"
