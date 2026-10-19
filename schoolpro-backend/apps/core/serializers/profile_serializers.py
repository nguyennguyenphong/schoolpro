"""
Serializers for Student Profile Management.
Conforms to MOET standards and Enterprise Clean Architecture.
"""

from rest_framework import serializers


class StudentHomeroomTeacherSerializer(serializers.Serializer):
    name = serializers.CharField(allow_blank=True, default="")
    phone = serializers.CharField(allow_blank=True, default="")
    email = serializers.CharField(allow_blank=True, default="")
    subject = serializers.CharField(allow_blank=True, default="")


class StudentPersonalInfoSerializer(serializers.Serializer):
    id = serializers.CharField()
    studentCode = serializers.CharField()
    fullName = serializers.CharField()
    firstName = serializers.CharField(allow_blank=True, default="")
    lastName = serializers.CharField(allow_blank=True, default="")
    preferredName = serializers.CharField(allow_blank=True, default="")
    username = serializers.CharField()
    avatarUrl = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    dateOfBirth = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    gender = serializers.CharField(allow_blank=True, default="MALE")
    nationalId = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    nationalIdIssuedDate = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    nationalIdIssuedPlace = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    admissionDate = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    ethnicity = serializers.CharField(allow_blank=True, default="Kinh")
    religion = serializers.CharField(allow_blank=True, default="Không")
    birthPlace = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    phone = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    email = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    address = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    permanentAddress = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    temporaryAddress = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    householdRegistrationNumber = serializers.CharField(
        allow_blank=True, allow_null=True, required=False
    )
    insuranceCardNumber = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    policyBeneficiary = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    bloodType = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    allergies = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    isBoarder = serializers.BooleanField(default=False)
    isPioneer = serializers.BooleanField(default=False)
    pioneerEntryDate = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    isUnionMember = serializers.BooleanField(default=False)
    unionEntryDate = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    specialNotes = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    bio = serializers.CharField(allow_blank=True, allow_null=True, required=False)


class StudentAcademicInfoSerializer(serializers.Serializer):
    className = serializers.CharField(default="")
    gradeLevel = serializers.CharField(default="")
    schoolName = serializers.CharField(default="")
    academicYear = serializers.CharField(default="")
    admissionDate = serializers.CharField(allow_blank=True, allow_null=True, default="")
    graduationDate = serializers.CharField(allow_blank=True, allow_null=True, default="")
    status = serializers.CharField(default="STUDYING")
    isBoarder = serializers.BooleanField(default=False)
    classroom = serializers.CharField(default="")
    homeroomTeacher = StudentHomeroomTeacherSerializer()


class StudentHealthRecordSerializer(serializers.Serializer):
    heightCm = serializers.FloatField(allow_null=True, default=0.0)
    weightKg = serializers.FloatField(allow_null=True, default=0.0)
    bmi = serializers.FloatField(allow_null=True, default=0.0)
    bloodType = serializers.CharField(allow_blank=True, default="O")
    allergies = serializers.CharField(allow_blank=True, default="")
    chronicIllness = serializers.CharField(allow_blank=True, default="")
    visionLeft = serializers.CharField(allow_blank=True, default="10/10")
    visionRight = serializers.CharField(allow_blank=True, default="10/10")
    hearingStatus = serializers.CharField(allow_blank=True, default="NORMAL")
    dentalStatus = serializers.CharField(allow_blank=True, default="NORMAL")
    skeletalStatus = serializers.CharField(allow_blank=True, default="NORMAL")
    healthClassification = serializers.CharField(allow_blank=True, default="TYPE_1")
    insuranceCode = serializers.CharField(allow_blank=True, default="")
    lastCheckupAt = serializers.CharField(allow_blank=True, allow_null=True, default="")
    specialCareInstructions = serializers.CharField(allow_blank=True, default="")
    notes = serializers.CharField(allow_blank=True, default="")


class StudentGuardianSerializer(serializers.Serializer):
    id = serializers.CharField()
    fullName = serializers.CharField()
    relationship = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    job = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    workplace = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    address = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    nationalId = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    isPrimaryContact = serializers.BooleanField(default=False)
    isEmergencyContact = serializers.BooleanField(default=False)
    isParentCommittee = serializers.BooleanField(default=False)
    committeeRole = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    notes = serializers.CharField(allow_blank=True, allow_null=True, required=False)


class StudentProfileResponseSerializer(serializers.Serializer):
    personalInfo = StudentPersonalInfoSerializer()
    academicInfo = StudentAcademicInfoSerializer()
    healthRecord = StudentHealthRecordSerializer()
    guardians = StudentGuardianSerializer(many=True)
    completionPercentage = serializers.IntegerField(default=100)


class StudentProfileUpdateSerializer(serializers.Serializer):
    # User identity & authentication fields
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    fullName = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    firstName = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    lastName = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    preferredName = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    dateOfBirth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    avatarUrl = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # Student dossier fields
    nationalId = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    nationalIdNumber = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    nationalIdIssuedDate = serializers.DateField(required=False, allow_null=True)
    nationalIdIssuedPlace = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    admissionDate = serializers.DateField(required=False, allow_null=True)
    permanentAddress = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    temporaryAddress = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    householdRegistrationNumber = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    birthPlace = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ethnicity = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    religion = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    insuranceCardNumber = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    policyBeneficiary = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bloodType = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    allergies = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    isBoarder = serializers.BooleanField(required=False)
    isPioneer = serializers.BooleanField(required=False)
    pioneerEntryDate = serializers.DateField(required=False, allow_null=True)
    isUnionMember = serializers.BooleanField(required=False)
    unionEntryDate = serializers.DateField(required=False, allow_null=True)
    specialNotes = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # Health record fields
    heightCm = serializers.FloatField(required=False, allow_null=True)
    weightKg = serializers.FloatField(required=False, allow_null=True)
    bmi = serializers.FloatField(required=False, allow_null=True)
    visionLeft = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    visionRight = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    hearingStatus = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    dentalStatus = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    skeletalStatus = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    chronicIllness = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    healthClassification = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    healthNotes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    specialCareInstructions = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    # Guardians collection (optional list of guardian dictionaries)
    guardians = serializers.ListField(
        child=serializers.DictField(), required=False, allow_empty=True
    )
