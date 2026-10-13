"""
Serializers for Academic Assignment and Submission domain.
Handles student homework views, detail payloads, online submissions, reopen requests, and score appeals.
"""

from rest_framework import serializers


class AssignmentAttachmentSerializer(serializers.Serializer):
    """
    Representation of teacher-provided assignment attachments.
    """

    name = serializers.CharField()
    size = serializers.CharField()
    url = serializers.CharField()


class AssignmentExtensionSerializer(serializers.Serializer):
    """
    Representation of a deadline extension granted by the teacher.
    """

    level = serializers.IntegerField()
    dueDate = serializers.CharField()
    reason = serializers.CharField(allow_blank=True, required=False)


class AssignmentRubricCriterionSerializer(serializers.Serializer):
    """
    Representation of a grading rubric criterion and optional student earned score.
    """

    id = serializers.CharField()
    criterion = serializers.CharField()
    maxPoints = serializers.FloatField()
    description = serializers.CharField(allow_blank=True, required=False)
    earnedPoints = serializers.FloatField(allow_null=True, required=False)
    comment = serializers.CharField(allow_blank=True, allow_null=True, required=False)


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

    id = serializers.CharField(required=False, allow_null=True)
    attemptNumber = serializers.IntegerField(default=1, required=False)
    submissionStatus = serializers.CharField(required=False, allow_null=True)
    submittedAt = serializers.CharField(allow_blank=True)
    isLate = serializers.BooleanField(default=False, required=False)
    lateMinutes = serializers.IntegerField(default=0, required=False)
    penaltyDeduction = serializers.FloatField(default=0.0, required=False)
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
    teacherEmail = serializers.CharField(allow_blank=True, required=False)
    status = serializers.CharField()
    approvedAt = serializers.CharField(allow_blank=True, allow_null=True, required=False)


class AssignmentEventLogSerializer(serializers.Serializer):
    """
    Chronological audit trail event for an assignment and student submission.
    """

    id = serializers.CharField()
    eventType = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True, required=False)
    actorName = serializers.CharField(allow_blank=True, required=False)
    createdAt = serializers.CharField()
    metadata = serializers.DictField(required=False)


class AssignmentItemResponseSerializer(serializers.Serializer):
    """
    Complete representation of an assignment item tailored for student frontend.
    """

    id = serializers.CharField()
    code = serializers.CharField(required=False)
    title = serializers.CharField()
    subjectCode = serializers.CharField()
    subjectName = serializers.CharField()
    className = serializers.CharField(allow_blank=True, required=False)
    teacherName = serializers.CharField()
    teacherEmail = serializers.CharField(allow_blank=True, required=False)
    type = serializers.CharField()
    format = serializers.CharField(required=False, default="HOMEWORK")
    status = serializers.CharField()
    dueDate = serializers.CharField()
    originalDueDate = serializers.CharField(required=False)
    isExtended = serializers.BooleanField(default=False, required=False)
    extensions = AssignmentExtensionSerializer(many=True, required=False)
    assignedDate = serializers.CharField()
    description = serializers.CharField(allow_blank=True, allow_null=True)
    pointsPossible = serializers.FloatField(default=10.0)
    passScore = serializers.FloatField(default=5.0, required=False)
    weightPercent = serializers.FloatField(default=10.0, required=False)
    score = serializers.FloatField(allow_null=True, required=False)
    rawScore = serializers.FloatField(allow_null=True, required=False)
    penaltyDeduction = serializers.FloatField(default=0.0, required=False)
    teacherFeedback = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    gradedAt = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    gradedByName = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    allowedFileTypes = serializers.ListField(
        child=serializers.CharField(), required=False, allow_null=True
    )
    maxFileSizeMb = serializers.IntegerField(default=25, required=False)
    maxFilesCount = serializers.IntegerField(default=5, required=False)
    fileNamingRule = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    allowLateSubmission = serializers.BooleanField(default=True, required=False)
    latePenaltyPercent = serializers.FloatField(default=0.0, required=False)
    allowResubmission = serializers.BooleanField(default=True, required=False)
    maxResubmissionCount = serializers.IntegerField(default=3, required=False)
    attachments = AssignmentAttachmentSerializer(many=True, required=False, allow_null=True)
    rubric = AssignmentRubricCriterionSerializer(many=True, required=False, allow_null=True)
    solutionAttachments = AssignmentAttachmentSerializer(many=True, required=False, allow_null=True)
    submission = AssignmentSubmissionSerializer(allow_null=True, required=False)
    reopenRequest = ReopenRequestSerializer(allow_null=True, required=False)
    eventLogs = AssignmentEventLogSerializer(many=True, required=False)


class AssignmentSubjectOptionSerializer(serializers.Serializer):
    """
    Subject filter option with total assignment count in the student's class.
    """

    code = serializers.CharField()
    name = serializers.CharField()
    count = serializers.IntegerField()


class AssignmentSummaryResponseSerializer(serializers.Serializer):
    """
    Aggregate counts, average score, and subject filter options for student assignment dashboard.
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
    subjects = AssignmentSubjectOptionSerializer(many=True, required=False)


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
