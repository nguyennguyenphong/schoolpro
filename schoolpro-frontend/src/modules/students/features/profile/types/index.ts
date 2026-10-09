export type GenderType = "MALE" | "FEMALE" | "OTHER";
export type AcademicStatus = "STUDYING" | "RESERVED" | "GRADUATED" | "SUSPENDED";
export type GuardianRelationship = "FATHER" | "MOTHER" | "GUARDIAN";
export type { ProfileTabKey } from "@/modules/students/features/profile/types/tabs";

export interface StudentPersonalInfo {
  id: string;
  studentCode: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: GenderType;
  nationalId: string;
  ethnicity: string;
  religion: string;
  birthPlace: string;
  phone: string;
  email: string;
  address: string;
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
  bloodType: string;
  allergies: string;
  chronicIllness: string;
  visionLeft: string;
  visionRight: string;
  insuranceCode: string;
  lastCheckupAt: string;
  notes: string;
}

export interface StudentGuardian {
  id: string;
  fullName: string;
  relationship: GuardianRelationship;
  phone: string;
  email: string;
  job: string;
  isPrimaryContact: boolean;
  isParentCommittee: boolean;
}

export interface StudentProfileData {
  personalInfo: StudentPersonalInfo;
  academicInfo: StudentAcademicInfo;
  healthRecord: StudentHealthRecord;
  guardians: StudentGuardian[];
  completionPercentage: number;
}

export interface UpdateProfilePayload {
  phone?: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
  healthNotes?: string;
}
