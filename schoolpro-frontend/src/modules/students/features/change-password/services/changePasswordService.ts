import type {
  ChangePasswordFormData,
  PasswordEvaluation,
  PasswordRequirementRule,
  PasswordStrengthLevel,
} from "@/modules/students/features/change-password/types";

export const changePasswordService = {
  evaluatePassword: (password: string): PasswordEvaluation => {
    const requirements: PasswordRequirementRule[] = [
      {
        key: "minLength",
        labelKey: "card:password.requirements.minChars",
        met: password.length >= 8,
      },
      {
        key: "uppercase",
        labelKey: "card:password.requirements.uppercase",
        met: /[A-Z]/.test(password),
      },
      {
        key: "lowercase",
        labelKey: "card:password.requirements.lowercase",
        met: /[a-z]/.test(password),
      },
      {
        key: "number",
        labelKey: "card:password.requirements.number",
        met: /[0-9]/.test(password),
      },
      {
        key: "special",
        labelKey: "card:password.requirements.specialChar",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];

    const passedCount = requirements.filter((r) => r.met).length;
    let score = 0;
    let level: PasswordStrengthLevel = "weak";

    if (password.length > 0) {
      score = Math.round((passedCount / requirements.length) * 100);
      if (passedCount <= 2) {
        level = "weak";
      } else if (passedCount === 3) {
        level = "fair";
      } else if (passedCount === 4) {
        level = "good";
      } else {
        level = "strong";
      }
    }

    return {
      score,
      level,
      requirements,
    };
  },

  changePassword: async (
    data: ChangePasswordFormData,
  ): Promise<{ success: boolean; errorKey?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simple mock validation check: simulate incorrect password if user enters "123456"
    if (data.currentPassword === "123456") {
      return { success: false, errorKey: "message:currentPasswordIncorrect" };
    }

    // Save timestamp of password update to local storage
    localStorage.setItem("schoolpro_last_password_change", new Date().toISOString());

    return { success: true };
  },
};
