from django.db import models

from common.models.base import UUIDModel


class Subject(UUIDModel):
    """
    Subject Model.

    Database Table: "core"."subjects"
    Description: Master subjects directory aligned with Vietnamese high school curriculum (GDPT 2018)
    """

    school = models.ForeignKey(
        "master.School",
        on_delete=models.CASCADE,
        db_column="school_id",
        related_name="subjects",
        db_comment="school_id foreign key",
    )
    department = models.ForeignKey(
        "master.Department",
        on_delete=models.SET_NULL,
        db_column="department_id",
        related_name="subjects",
        null=True,
        blank=True,
        db_comment="department_id foreign key",
    )
    code = models.CharField(
        max_length=20,
    )
    name = models.CharField(
        max_length=150,
    )
    grade_level = models.SmallIntegerField(null=True, blank=True)
    evaluation_type = models.CharField(
        max_length=20,
    )
    is_compulsory = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    metadata = models.JSONField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = '"core"."subjects"'
        verbose_name = "Subject"
        verbose_name_plural = "Subjects"
        ordering = ["code"]

    def __str__(self) -> str:
        return str(self.name)

    def __repr__(self) -> str:
        return f"<Subject {self.pk}>"
