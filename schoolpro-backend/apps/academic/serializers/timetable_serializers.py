"""
Serializers for Academic Timetable domain.
Provides formatted representations for weekly grid and agenda views.
"""

from rest_framework import serializers


class TimetableSlotResponseSerializer(serializers.Serializer):
    """
    Representation of a single timetable lesson slot formatted for frontend clients.
    """

    id = serializers.CharField()
    courseCode = serializers.CharField()
    courseName = serializers.CharField()
    classCode = serializers.CharField()
    className = serializers.CharField(allow_blank=True, required=False)
    credits = serializers.IntegerField(default=2)
    dayOfWeek = serializers.IntegerField()
    date = serializers.CharField()
    periods = serializers.CharField()
    startTime = serializers.CharField()
    endTime = serializers.CharField()
    shift = serializers.CharField()
    room = serializers.CharField()
    building = serializers.CharField()
    campus = serializers.CharField()
    instructorName = serializers.CharField()
    instructorEmail = serializers.CharField(allow_blank=True, required=False)
    instructorPhone = serializers.CharField(allow_blank=True, required=False)
    classType = serializers.CharField()
    status = serializers.CharField()
    attendanceStatus = serializers.CharField()
    isOnLeave = serializers.BooleanField(default=False, required=False)
    leaveStatus = serializers.CharField(allow_null=True, required=False)
    leaveSessionShift = serializers.CharField(allow_null=True, required=False)
    leaveType = serializers.CharField(allow_null=True, required=False)
    leaveReason = serializers.CharField(allow_null=True, required=False)
    leaveRequestCode = serializers.CharField(allow_null=True, required=False)
    onlineUrl = serializers.CharField(allow_null=True, required=False)
    lessonTopic = serializers.CharField(allow_null=True, required=False)
    notes = serializers.CharField(allow_null=True, required=False)
    colorTheme = serializers.CharField(required=False)


class TimetableSummaryResponseSerializer(serializers.Serializer):
    """
    Summary overview metrics for timetable view.
    """

    totalSessions = serializers.IntegerField()
    totalCredits = serializers.IntegerField()
    totalTheorySessions = serializers.IntegerField()
    totalPracticeSessions = serializers.IntegerField()
    attendanceRate = serializers.IntegerField()
    upcomingSessions = serializers.IntegerField()
    ongoingSessions = serializers.IntegerField()
    completedSessions = serializers.IntegerField()


class CourseOptionSerializer(serializers.Serializer):
    """
    Option representation for course filtering.
    """

    code = serializers.CharField()
    name = serializers.CharField()
