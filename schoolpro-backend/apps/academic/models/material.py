from django.db import models

from common.models.base import UUIDModel


class CurriculumMaterial(UUIDModel):
    """
    CurriculumMaterial Model.

    Database Table: "academic"."curriculum_materials"
    Description: Online learning resources, slides, and syllabus documents
    """

    class_subject_teacher_id = models.UUIDField(null=True, blank=True)
    subject_id = models.UUIDField()
    title = models.CharField(
        max_length=255,
    )
    chapter_name = models.CharField(max_length=150, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    material_type = models.CharField(
        max_length=20,
    )
    target_grade_id = models.UUIDField(null=True, blank=True)
    is_shared_all_classes = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField()
    created_by = models.UUIDField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."curriculum_materials"'
        verbose_name = "Curriculum Material"
        verbose_name_plural = "Curriculum Materials"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<CurriculumMaterial {self.pk}>"


class MaterialAttachment(UUIDModel):
    """
    MaterialAttachment Model.

    Database Table: "academic"."material_attachments"
    Description: Binary attachment references (PDF, DOCX, MP4) for materials
    """

    material = models.ForeignKey(
        "academic.CurriculumMaterial",
        on_delete=models.CASCADE,
        db_column="material_id",
        related_name="+",
        db_comment="material_id foreign key",
    )
    file_name = models.CharField(
        max_length=255,
    )
    file_url = models.TextField()
    file_type = models.CharField(max_length=50, null=True, blank=True)
    file_size_bytes = models.BigIntegerField(null=True, blank=True)
    download_count = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = '"academic"."material_attachments"'
        verbose_name = "Material Attachment"
        verbose_name_plural = "Material Attachments"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"MaterialAttachment ({self.pk})"

    def __repr__(self) -> str:
        return f"<MaterialAttachment {self.pk}>"
