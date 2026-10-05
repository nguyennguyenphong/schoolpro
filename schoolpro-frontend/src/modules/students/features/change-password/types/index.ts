export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions: boolean;
}

export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong";

export interface PasswordRequirementRule {
  key: string;
  labelKey: string;
  met: boolean;
}

export interface PasswordEvaluation {
  score: number; // 0 to 100
  level: PasswordStrengthLevel;
  requirements: PasswordRequirementRule[];
}
