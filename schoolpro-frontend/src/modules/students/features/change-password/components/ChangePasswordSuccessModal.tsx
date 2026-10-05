import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface ChangePasswordSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordSuccessModal: React.FC<ChangePasswordSuccessModalProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation(["modal", "button", "navigation"]);
  const navigate = useNavigate();

  const handleGoProfile = () => {
    onClose();
    navigate("/student/profile");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={460}
      className="rounded-2xl overflow-hidden"
    >
      <div className="text-center py-5 px-3 sm:px-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-xs">
          <Icon name="check" size={32} />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          {t("modal:passwordSuccessTitle")}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          {t("modal:passwordSuccessContent")}
        </p>

        <div className="flex items-center gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-5 h-10 text-xs sm:text-sm font-semibold border-slate-200 text-slate-700 hover:border-slate-300"
          >
            {t("button:close")}
          </Button>
          <Button
            variant="primary"
            onClick={handleGoProfile}
            className="rounded-xl px-5 h-10 text-xs sm:text-sm font-semibold shadow-xs shadow-blue-500/25"
          >
            <Icon name="user" size={14} className="mr-1.5" />
            {t("navigation:breadcrumb.profile")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
