"""
Serializers for Curriculum Materials and Learning Resources domain.
Provides DTOs for subject cards, learning materials, downloads, bookmarks, and summary metrics.
"""

from rest_framework import serializers


class SubjectMaterialItemSerializer(serializers.Serializer):
    """
    Serializer for subject-level material summary card.
    """

    id = serializers.CharField()
    code = serializers.CharField()
    name = serializers.CharField()
    teacher = serializers.CharField()
    teacherTitle = serializers.CharField(default="Giáo viên bộ môn")
    semester = serializers.CharField(default="Học kỳ 1")
    academicYear = serializers.CharField(default="2025-2026")
    colorScheme = serializers.CharField(default="blue")
    description = serializers.CharField(allow_blank=True, default="")
    totalMaterials = serializers.IntegerField(default=0)
    lecturesCount = serializers.IntegerField(default=0)
    outlinesCount = serializers.IntegerField(default=0)
    examsCount = serializers.IntegerField(default=0)
    totalDownloads = serializers.IntegerField(default=0)


class MaterialAttachmentItemSerializer(serializers.Serializer):
    """
    Serializer for material binary attachments.
    """

    id = serializers.CharField()
    fileName = serializers.CharField()
    fileUrl = serializers.CharField()
    fileType = serializers.CharField(default="pdf")
    mimeType = serializers.CharField(default="application/pdf")
    fileSizeBytes = serializers.IntegerField(default=0)
    fileSize = serializers.CharField(default="0 MB")
    isDownloadable = serializers.BooleanField(default=True)


class MaterialItemSerializer(serializers.Serializer):
    """
    Serializer for learning material resource item.
    """

    id = serializers.CharField()
    title = serializers.CharField()
    subjectCode = serializers.CharField()
    subjectName = serializers.CharField()
    category = serializers.CharField(default="lecture")
    format = serializers.CharField(default="pdf")
    fileName = serializers.CharField()
    fileSize = serializers.CharField()
    fileUrl = serializers.CharField()
    previewUrl = serializers.CharField(allow_null=True, required=False)
    author = serializers.CharField()
    uploadDate = serializers.CharField()
    downloadsCount = serializers.IntegerField(default=0)
    viewsCount = serializers.IntegerField(default=0)
    semester = serializers.CharField(default="Học kỳ 1")
    academicYear = serializers.CharField(default="2025-2026")
    description = serializers.CharField(allow_blank=True, default="")
    tableOfContents = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    isBookmarked = serializers.BooleanField(default=False)
    isFeatured = serializers.BooleanField(default=False)
    attachments = MaterialAttachmentItemSerializer(many=True, required=False, default=list)


class MaterialSummarySerializer(serializers.Serializer):
    """
    Serializer for aggregate statistics of learning materials.
    """

    total = serializers.IntegerField(default=0)
    lecturesCount = serializers.IntegerField(default=0)
    outlinesCount = serializers.IntegerField(default=0)
    textbooksCount = serializers.IntegerField(default=0)
    examPrepsCount = serializers.IntegerField(default=0)
    totalDownloads = serializers.IntegerField(default=0)
