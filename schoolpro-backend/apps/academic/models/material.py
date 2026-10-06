from django.db import models

from common.models.base import UUIDModel


class CurriculumMaterial(UUIDModel):
    """
    CurriculumMaterial Model.

    Database Table: "academic"."curriculum_materials"
    Description: Online learning resources, slides, and syllabus documents
    """

    class_subject_teacher = models.ForeignKey(
        "core.ClassSubjectTeacher",
        on_delete=models.SET_NULL,
        db_column="class_subject_teacher_id",
        null=True,
        blank=True,
        related_name="materials",
    )
    subject = models.ForeignKey(
        "master.Subject",
        on_delete=models.CASCADE,
        db_column="subject_id",
        related_name="materials",
    )
    title = models.CharField(max_length=255)
    chapter_name = models.CharField(max_length=150, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    material_type = models.CharField(max_length=20, default="DOCUMENT")
    target_grade = models.ForeignKey(
        "master.Grade",
        on_delete=models.SET_NULL,
        db_column="target_grade_id",
        null=True,
        blank=True,
        related_name="materials",
    )
    visibility = models.CharField(max_length=20, default="CLASS")
    file_url = models.CharField(max_length=1000, null=True, blank=True)
    file_size_bytes = models.BigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, null=True, blank=True)
    download_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    tags = models.TextField(null=True, blank=True)
    is_shared_all_classes = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        db_column="created_by",
        related_name="created_materials",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."curriculum_materials"'
        verbose_name = "Curriculum Material"
        verbose_name_plural = "Curriculum Materials"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.title)

    def __repr__(self) -> str:
        return f"<CurriculumMaterial {self.pk}: {self.title}>"


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
        related_name="attachments",
        db_comment="material_id foreign key",
    )
    file_name = models.CharField(max_length=255)
    file_url = models.TextField()
    storage_path = models.CharField(max_length=500, null=True, blank=True)
    file_type = models.CharField(max_length=50, null=True, blank=True)
    mime_type = models.CharField(max_length=100, null=True, blank=True)
    file_size_bytes = models.BigIntegerField(null=True, blank=True)
    checksum = models.CharField(max_length=64, null=True, blank=True)
    is_previewable = models.BooleanField(default=True)
    download_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    version = models.SmallIntegerField(default=1)
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = '"academic"."material_attachments"'
        verbose_name = "Material Attachment"
        verbose_name_plural = "Material Attachments"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"MaterialAttachment ({self.file_name})"

    def __repr__(self) -> str:
        return f"<MaterialAttachment {self.pk}>"
