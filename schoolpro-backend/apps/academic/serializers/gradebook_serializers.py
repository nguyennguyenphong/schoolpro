"""
Serializers for Academic Gradebook and Official Transcripts.
Complies with MOET Circular 22/2021/TT-BGDĐT grading standards.
"""

from rest_framework import serializers


class ScoreItemSerializer(serializers.Serializer):
    """
    Serializer for individual evaluation mark (oral, 15m, practice, midterm, final).
    """

    id = serializers.CharField()
    name = serializers.CharField()
    score = serializers.FloatField()
    date = serializers.CharField()
    weight = serializers.IntegerField(default=1)
    note = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class SubjectGradeItemSerializer(serializers.Serializer):
    """
    Serializer for comprehensive subject grade row in gradebook.
    """

    id = serializers.CharField()
    code = serializers.CharField()
    name = serializers.CharField()
    teacher = serializers.CharField()
    teacherTitle = serializers.CharField(default="Giáo viên bộ môn")
    periodsPerWeek = serializers.IntegerField(default=2)
    evaluationType = serializers.CharField(default="score")
    regularScores = ScoreItemSerializer(many=True, default=list)
    midtermScore = ScoreItemSerializer(allow_null=True, required=False)
    finalScore = ScoreItemSerializer(allow_null=True, required=False)
    averageScore = serializers.FloatField(allow_null=True, required=False)
    gradeLevel = serializers.CharField(default="good")
    feedbackResult = serializers.CharField(allow_null=True, required=False)
    teacherComment = serializers.CharField(allow_blank=True, default="")
    classAverage = serializers.FloatField(allow_null=True, required=False)
    highestScore = serializers.FloatField(allow_null=True, required=False)


class GradeSummarySerializer(serializers.Serializer):
    """
    Serializer for term/annual summary statistics card and honor roll metrics.
    """

    gpa = serializers.FloatField()
    academicRank = serializers.CharField()
    conductRank = serializers.CharField()
    classPosition = serializers.IntegerField(default=1)
    totalClassStudents = serializers.IntegerField(default=40)
    excellentSubjectsCount = serializers.IntegerField(default=0)
    totalSubjectsCount = serializers.IntegerField(default=13)
    passSubjectsCount = serializers.IntegerField(default=0)
    totalCreditsOrPeriods = serializers.IntegerField(default=29)
    homeroomTeacher = serializers.CharField()
    homeroomComment = serializers.CharField()
    titleAwarded = serializers.CharField()
    attendanceRate = serializers.FloatField(default=100.0)
    academicYear = serializers.CharField(required=False, allow_null=True)
    semester = serializers.CharField(required=False, allow_null=True)
    className = serializers.CharField(required=False, allow_null=True)


class GradebookTranscriptSubjectSerializer(serializers.Serializer):
    """
    Item serializer for official e-transcript / report card view.
    """

    code = serializers.CharField()
    name = serializers.CharField()
    teacher = serializers.CharField()
    periodsPerWeek = serializers.IntegerField()
    evaluationType = serializers.CharField()
    regularScoresStr = serializers.CharField()
    midtermScore = serializers.FloatField(allow_null=True)
    finalScore = serializers.FloatField(allow_null=True)
    averageScore = serializers.FloatField(allow_null=True)
    feedbackResult = serializers.CharField(allow_null=True)
    gradeLevel = serializers.CharField()
    teacherComment = serializers.CharField(allow_blank=True)


class GradebookTranscriptSerializer(serializers.Serializer):
    """
    Serializer for national electronic report card (Học bạ điện tử) compliant with MOET Circular 22.
    """

    studentName = serializers.CharField()
    studentCode = serializers.CharField()
    className = serializers.CharField()
    academicYear = serializers.CharField()
    semester = serializers.CharField()
    schoolName = serializers.CharField()
    principalName = serializers.CharField()
    homeroomTeacher = serializers.CharField()
    homeroomComment = serializers.CharField()
    gpa = serializers.FloatField()
    academicRank = serializers.CharField()
    conductRank = serializers.CharField()
    titleAwarded = serializers.CharField()
    rankInClass = serializers.IntegerField()
    totalStudents = serializers.IntegerField()
    isPromoted = serializers.BooleanField(default=True)
    decisionNumber = serializers.CharField()
    digitalSignature = serializers.CharField()
    verifiedAt = serializers.CharField()
    subjects = GradebookTranscriptSubjectSerializer(many=True)
