"""
Serializers for Academic Assignment and Submission domain.
Handles student homework views, detail payloads, and online submissions.
"""

from rest_framework import serializers


class AssignmentAttachmentSerializer(serializers.Serializer):
    """
    Representation of teacher-provided assignment attachments.
    """

    name = serializers.CharField()
    size = serializers.CharField()
    url = serializers.CharField()


class SubmittedFileSerializer(serializers.Serializer):
    """
    Representation of an individual file submitted by a student.
    """

    id = serializers.CharField()
    name = serializers.CharField()
    size = serializers.CharField()
    sizeBytes = serializers.IntegerField(required=False, allow_null=True)
    type = serializers.CharField()
    url = serializers.CharField(required=False, allow_null=True)
    uploadedAt = serializers.CharField(required=False, allow_null=True)


class AssignmentSubmissionSerializer(serializers.Serializer):
    """
    Details of student submission, response text, and uploaded artifacts.
    """

    submittedAt = serializers.CharField()
    content = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    fileName = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    fileUrl = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    files = SubmittedFileSerializer(many=True, required=False)


class ReopenRequestSerializer(serializers.Serializer):
    """
    Metadata for late reopen requests sent to teachers.
    """

    requestedAt = serializers.CharField()
    reason = serializers.CharField()
    teacherEmail = serializers.CharField()
    status = serializers.CharField()


class AssignmentItemResponseSerializer(serializers.Serializer):
    """
    Complete representation of an assignment item tailored for student frontend.
    """

    id = serializers.CharField()
    title = serializers.CharField()
    subjectCode = serializers.CharField()
    subjectName = serializers.CharField()
    teacherName = serializers.CharField()
    teacherEmail = serializers.CharField(allow_blank=True, required=False)
    type = serializers.CharField()
    status = serializers.CharField()
    dueDate = serializers.CharField()
    assignedDate = serializers.CharField()
    description = serializers.CharField(allow_blank=True, allow_null=True)
    pointsPossible = serializers.FloatField(default=10.0)
    score = serializers.FloatField(allow_null=True, required=False)
    teacherFeedback = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    attachments = AssignmentAttachmentSerializer(many=True, required=False, allow_null=True)
    submission = AssignmentSubmissionSerializer(allow_null=True, required=False)
    reopenRequest = ReopenRequestSerializer(allow_null=True, required=False)


class AssignmentSummaryResponseSerializer(serializers.Serializer):
    """
    Aggregate counts and average score for student assignment dashboard.
    """

    total = serializers.IntegerField()
    pendingCount = serializers.IntegerField()
    submittedCount = serializers.IntegerField()
    gradedCount = serializers.IntegerField()
    overdueCount = serializers.IntegerField()
    averageScore = serializers.FloatField()
    className = serializers.CharField(required=False, allow_null=True)
    semesterName = serializers.CharField(required=False, allow_null=True)
    academicYear = serializers.CharField(required=False, allow_null=True)


class SubmitAssignmentRequestSerializer(serializers.Serializer):
    """
    Input serializer for submitting an assignment online.
    """

    content = serializers.CharField(allow_blank=True, required=False)
    fileName = serializers.CharField(allow_blank=True, required=False)
    fileUrl = serializers.CharField(allow_blank=True, required=False)
    files = serializers.ListField(child=serializers.DictField(), required=False)


class ReopenRequestInputSerializer(serializers.Serializer):
    """
    Input serializer for requesting a teacher to reopen late submission.
    """

    reason = serializers.CharField(max_length=1000, required=True)
