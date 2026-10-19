export type GenderType = "MALE" | "FEMALE" | "OTHER";
export type AcademicStatus = "STUDYING" | "RESERVED" | "GRADUATED" | "SUSPENDED";
export type GuardianRelationship = "FATHER" | "MOTHER" | "GUARDIAN";
export type { ProfileTabKey } from "@/modules/students/features/profile/types/tabs";

export interface StudentPersonalInfo {
  id: string;
  studentCode: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  username: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: GenderType;
  admissionDate?: string;
  nationalId: string;
  nationalIdIssuedDate?: string;
  nationalIdIssuedPlace?: string;
  ethnicity: string;
  religion: string;
  birthPlace: string;
  phone: string;
  email: string;
  address: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  householdRegistrationNumber?: string;
  insuranceCardNumber?: string;
  policyBeneficiary?: string;
  bloodType?: string;
  allergies?: string;
  isBoarder?: boolean;
  isPioneer?: boolean;
  pioneerEntryDate?: string;
  isUnionMember?: boolean;
  unionEntryDate?: string;
  specialNotes?: string;
  bio?: string;
}

export interface ProfileHomeroomTeacherInfo {
  name: string;
  phone: string;
  email: string;
  subject: string;
}

export interface StudentAcademicInfo {
  className: string;
  gradeLevel: string;
  schoolName: string;
  academicYear: string;
  admissionDate: string;
  graduationDate: string | null;
  status: AcademicStatus;
  isBoarder: boolean;
  classroom: string;
  homeroomTeacher: ProfileHomeroomTeacherInfo;
}

export interface StudentHealthRecord {
  heightCm: number;
  weightKg: number;
  bmi?: number;
  bloodType: string;
  allergies: string;
  chronicIllness: string;
  visionLeft: string;
  visionRight: string;
  hearingStatus?: string;
  dentalStatus?: string;
  skeletalStatus?: string;
  healthClassification?: string;
  insuranceCode: string;
  lastCheckupAt: string;
  specialCareInstructions?: string;
  notes: string;
}

export interface StudentGuardian {
  id: string;
  fullName: string;
  relationship: GuardianRelationship;
  phone: string;
  email: string;
  job: string;
  workplace?: string;
  address?: string;
  nationalId?: string;
  isPrimaryContact: boolean;
  isEmergencyContact?: boolean;
  isParentCommittee: boolean;
  committeeRole?: string;
  notes?: string;
}

export interface StudentProfileData {
  personalInfo: StudentPersonalInfo;
  academicInfo: StudentAcademicInfo;
  healthRecord: StudentHealthRecord;
  guardians: StudentGuardian[];
  completionPercentage: number;
}

export interface UpdateProfilePayload {
  // Identity & Account fields
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  dateOfBirth?: string;
  gender?: GenderType | string;
  nationalId?: string;
  nationalIdNumber?: string;
  admissionDate?: string;

  // Contact & User fields
  phone?: string;
  email?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;

  // Residence & Citizen fields
  permanentAddress?: string;
  temporaryAddress?: string;
  householdRegistrationNumber?: string;
  birthPlace?: string;
  ethnicity?: string;
  religion?: string;
  nationalIdIssuedDate?: string;
  nationalIdIssuedPlace?: string;

  // Insurance & Policies
  insuranceCardNumber?: string;
  policyBeneficiary?: string;

  // Organization & youth affiliation
  isPioneer?: boolean;
  pioneerEntryDate?: string;
  isUnionMember?: boolean;
  unionEntryDate?: string;
  specialNotes?: string;

  // Health record
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  bloodType?: string;
  visionLeft?: string;
  visionRight?: string;
  hearingStatus?: string;
  dentalStatus?: string;
  skeletalStatus?: string;
  healthClassification?: string;
  allergies?: string;
  chronicIllness?: string;
  healthNotes?: string;
  specialCareInstructions?: string;

  // Guardians
  guardians?: Partial<StudentGuardian>[];
}
