"""
Serializers for Academic Exam domain.
Supports Google Form-like dynamic question types, scores per question,
required validations, submissions, auto-grading, and summaries.
"""

from rest_framework import serializers


class ExamQuestionSerializer(serializers.Serializer):
    """
    Representation of a dynamic exam question (Google Form style).
    Supports: radio, checkbox, input, textarea, select, rating, boolean, date.
    """

    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    type = serializers.CharField(default="radio")
    required = serializers.BooleanField(default=False)
    points = serializers.FloatField(default=1.0)
    options = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    correctAnswer = serializers.JSONField(required=False, allow_null=True)
    explanation = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    placeholder = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    ratingMax = serializers.IntegerField(default=5, required=False)
    sectionName = serializers.CharField(allow_blank=True, allow_null=True, required=False)


class ExamItemSerializer(serializers.Serializer):
    """
    Representation of an examination event with metadata and dynamic questions.
    """

    id = serializers.CharField()
    code = serializers.CharField()
    title = serializers.CharField()
    courseCode = serializers.CharField()
    courseName = serializers.CharField()
    teacherName = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    semester = serializers.CharField()
    academicYear = serializers.CharField()
    durationMinutes = serializers.IntegerField(default=45)
    totalQuestions = serializers.IntegerField(default=0)
    maxScore = serializers.FloatField(default=10.0)
    passingScore = serializers.FloatField(default=5.0, required=False)
    startDate = serializers.CharField()
    endDate = serializers.CharField()
    status = serializers.CharField(default="pending")
    score = serializers.FloatField(allow_null=True, required=False)
    completedAt = serializers.CharField(allow_null=True, required=False)
    scoreReleaseMode = serializers.CharField(default="immediate", required=False)
    scoreReleaseDate = serializers.CharField(allow_null=True, required=False)
    questions = ExamQuestionSerializer(many=True, required=False)


class ExamSummarySerializer(serializers.Serializer):
    """
    Aggregate counts and average score for student examination dashboard.
    """

    total = serializers.IntegerField()
    pendingCount = serializers.IntegerField()
    completedCount = serializers.IntegerField()
    expiredCount = serializers.IntegerField()
    averageScore = serializers.FloatField()


class ExamSubmitRequestSerializer(serializers.Serializer):
    """
    Payload for submitting an exam attempt.
    """

    answers = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Mapping from question ID to answer (string, array of strings, number, boolean)",
    )
    allowIncomplete = serializers.BooleanField(default=False, required=False)


class ExamQuestionResultSerializer(serializers.Serializer):
    """
    Evaluation result for an individual question.
    """

    questionId = serializers.CharField()
    isCorrect = serializers.BooleanField(allow_null=True)
    awardedScore = serializers.FloatField()
    maxPoints = serializers.FloatField()
    studentAnswer = serializers.JSONField(required=False, allow_null=True)
    correctAnswer = serializers.JSONField(required=False, allow_null=True)
    explanation = serializers.CharField(allow_blank=True, allow_null=True, required=False)


class ExamSubmissionResponseSerializer(serializers.Serializer):
    """
    Response returned after submitting an exam attempt.
    """

    examId = serializers.CharField()
    submissionId = serializers.CharField()
    score = serializers.FloatField(allow_null=True, required=False)
    maxScore = serializers.FloatField()
    isPassed = serializers.BooleanField(allow_null=True, required=False)
    submittedAt = serializers.CharField()
    durationSeconds = serializers.IntegerField(default=0)
    answers = serializers.DictField(child=serializers.JSONField())
    breakdown = ExamQuestionResultSerializer(many=True, required=False)
    message = serializers.CharField(default="Nộp bài thi thành công!")
