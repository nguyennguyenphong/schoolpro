import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";
import { changePasswordService } from "@/modules/students/features/change-password/services/changePasswordService";
import type {
  ChangePasswordFormData,
  PasswordEvaluation,
} from "@/modules/students/features/change-password/types";

export const useChangePassword = () => {
  const { t } = useTranslation(["message", "card", "common"]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [newPasswordValue, setNewPasswordValue] = useState<string>("");

  const evaluation: PasswordEvaluation = useMemo(() => {
    return changePasswordService.evaluatePassword(newPasswordValue);
  }, [newPasswordValue]);

  const handleChangePassword = async (data: ChangePasswordFormData): Promise<boolean> => {
    if (evaluation.level === "weak") {
      message.error(t("message:passwordMismatch"));
      return false;
    }

    try {
      setSubmitting(true);
      const res = await changePasswordService.changePassword(data);
      if (res.success) {
        message.success(t("message:passwordChangedSuccess"));
        setIsSuccessModalOpen(true);
        return true;
      } else if (res.errorKey) {
        message.error(t(res.errorKey as any));
        return false;
      }
      return false;
    } catch (err) {
      console.error("Failed to change password:", err);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    newPasswordValue,
    setNewPasswordValue,
    evaluation,
    handleChangePassword,
  };
};
