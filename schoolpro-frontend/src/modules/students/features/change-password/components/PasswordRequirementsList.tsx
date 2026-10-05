import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { PasswordRequirementRule } from "@/modules/students/features/change-password/types";

interface PasswordRequirementsListProps {
  requirements: PasswordRequirementRule[];
}

export const PasswordRequirementsList: React.FC<PasswordRequirementsListProps> = ({
  requirements,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="shield-check" size={13} />
        </span>
        <span className="font-bold text-xs sm:text-sm text-slate-800">
          {t("card:password.requirements.title")}
        </span>
      </div>

      <div className="space-y-2">
        {requirements.map((req) => (
          <div
            key={req.key}
            className={`flex items-center gap-2.5 text-xs transition-colors p-1.5 rounded-lg ${
              req.met ? "text-emerald-700 bg-emerald-50/50" : "text-slate-500"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                req.met
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-white border-slate-300 text-transparent"
              }`}
            >
              <Icon name="check" size={10} />
            </span>
            <span className={req.met ? "font-semibold" : ""}>
              {t(req.labelKey as any)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
