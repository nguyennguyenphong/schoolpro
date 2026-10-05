"""
Department Serializers.
Input DTOs and Response Serializers for Department master management.
"""

from rest_framework import serializers

from apps.master.models.department import Department


class DepartmentLeaderBriefSerializer(serializers.Serializer):
    """Brief serializer for department leader/vice leader user profile."""

    id = serializers.UUIDField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    avatar_url = serializers.CharField(read_only=True, allow_null=True)


class DepartmentMemberTeacherSerializer(serializers.Serializer):
    """Brief teacher member serializer in department."""

    id = serializers.UUIDField(read_only=True)
    teacher_code = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    subject_major = serializers.CharField(read_only=True)
    qualification = serializers.CharField(read_only=True, allow_null=True)
    status = serializers.CharField(read_only=True)
    is_homeroom = serializers.BooleanField(read_only=True)


class DepartmentMemberStaffSerializer(serializers.Serializer):
    """Brief staff member serializer in department."""

    id = serializers.UUIDField(read_only=True)
    staff_code = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)


class DepartmentSubjectSerializer(serializers.Serializer):
    """Brief subject serializer belonging to department."""

    id = serializers.UUIDField(read_only=True)
    code = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)
    grade_level = serializers.IntegerField(read_only=True, allow_null=True)
    evaluation_type = serializers.CharField(read_only=True)
    is_compulsory = serializers.BooleanField(read_only=True)


class DepartmentListSerializer(serializers.ModelSerializer):
    """
    Serializer for paginated or listed departments.
    """

    leader_teacher = DepartmentLeaderBriefSerializer(read_only=True)
    vice_leader = DepartmentLeaderBriefSerializer(read_only=True)
    school_name = serializers.CharField(source="school.name", read_only=True)
    teachers_count = serializers.IntegerField(read_only=True, default=0)
    staff_count = serializers.IntegerField(read_only=True, default=0)
    subjects_count = serializers.IntegerField(read_only=True, default=0)
    total_members_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            "id",
            "school_id",
            "school_name",
            "code",
            "name",
            "department_type",
            "leader_teacher",
            "vice_leader",
            "is_active",
            "teachers_count",
            "staff_count",
            "subjects_count",
            "total_members_count",
            "created_at",
        ]
        read_only_fields = fields

    def get_total_members_count(self, obj: Department) -> int:
        teachers_count = getattr(obj, "teachers_count", 0) or 0
        staff_count = getattr(obj, "staff_count", 0) or 0
        return teachers_count + staff_count


class DepartmentDetailSerializer(DepartmentListSerializer):
    """
    Detailed serializer including members lists and assigned subjects.
    """

    teachers = serializers.SerializerMethodField()
    staff_members = serializers.SerializerMethodField()
    subjects = serializers.SerializerMethodField()

    class Meta(DepartmentListSerializer.Meta):
        fields = DepartmentListSerializer.Meta.fields + [
            "teachers",
            "staff_members",
            "subjects",
        ]

    def get_teachers(self, obj: Department):
        teachers_qs = obj.teachers.select_related("user").all()
        return DepartmentMemberTeacherSerializer(teachers_qs, many=True).data

    def get_staff_members(self, obj: Department):
        staff_qs = obj.staff.select_related("user").all()
        return DepartmentMemberStaffSerializer(staff_qs, many=True).data

    def get_subjects(self, obj: Department):
        subjects_qs = obj.subjects.all()
        return DepartmentSubjectSerializer(subjects_qs, many=True).data


class DepartmentCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating departments.
    Validates unique code within school and valid leader users.
    """

    school_id = serializers.UUIDField(required=False, allow_null=True)
    leader_teacher_id = serializers.UUIDField(required=False, allow_null=True)
    vice_leader_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Department
        fields = [
            "school_id",
            "code",
            "name",
            "department_type",
            "leader_teacher_id",
            "vice_leader_id",
            "is_active",
        ]

    def validate_code(self, value: str) -> str:
        trimmed = value.strip().upper()
        if not trimmed:
            raise serializers.ValidationError("Mã tổ/phòng ban không được để trống.")
        return trimmed

    def validate_name(self, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Tên tổ/phòng ban không được để trống.")
        return trimmed

    def validate_department_type(self, value: str) -> str:
        trimmed = value.strip().upper()
        valid_types = ["SUBJECT", "ADMINISTRATION", "BOARD", "UNION", "OTHER"]
        if trimmed not in valid_types:
            raise serializers.ValidationError(
                f"Loại phòng ban không hợp lệ. Phải là một trong: {', '.join(valid_types)}"
            )
        return trimmed


class DepartmentSummarySerializer(serializers.Serializer):
    """Response serializer for department statistics summary."""

    total_departments = serializers.IntegerField()
    active_departments = serializers.IntegerField()
    inactive_departments = serializers.IntegerField()
    subject_departments = serializers.IntegerField()
    administration_departments = serializers.IntegerField()
    other_departments = serializers.IntegerField()
