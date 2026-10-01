import uuid

from django.db import models


class Grade(models.Model):
    """
    Grade Model.

    Database Table: "core"."grades"
    Description: Master high school grade tiers (Grade 10, 11, 12) and assigned grade supervisor
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="+",
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

    def __str__(self) -> str:
        return str(self.name)
