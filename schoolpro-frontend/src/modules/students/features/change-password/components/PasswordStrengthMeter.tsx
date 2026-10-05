import React from "react";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/Progress";
import type { PasswordStrengthLevel } from "@/modules/students/features/change-password/types";

interface PasswordStrengthMeterProps {
  score: number;
  level: PasswordStrengthLevel;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ score, level }) => {
  const { t } = useTranslation(["card"]);

  const getColorConfig = (lvl: PasswordStrengthLevel): { color: string; badgeClass: string } => {
    switch (lvl) {
      case "weak":
        return { color: "#ef4444", badgeClass: "text-rose-600 bg-rose-50 border-rose-200" };
      case "fair":
        return { color: "#f59e0b", badgeClass: "text-amber-600 bg-amber-50 border-amber-200" };
      case "good":
        return { color: "#3b82f6", badgeClass: "text-blue-600 bg-blue-50 border-blue-200" };
      case "strong":
        return { color: "#10b981", badgeClass: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      default:
        return { color: "#cbd5e1", badgeClass: "text-slate-500 bg-slate-50 border-slate-200" };
    }
  };

  const getLabelKey = (lvl: PasswordStrengthLevel): string => {
    switch (lvl) {
      case "weak":
        return "card:password.strength.weak";
      case "fair":
        return "card:password.strength.fair";
      case "good":
        return "card:password.strength.good";
      case "strong":
        return "card:password.strength.strong";
      default:
        return "card:password.strength.weak";
    }
  };

  if (score === 0) return null;

  const { color, badgeClass } = getColorConfig(level);

  return (
    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 my-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">
          {t("card:password.strength.title")}:
        </span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
          {t(getLabelKey(level) as any)}
        </span>
      </div>
      <Progress
        percent={score}
        strokeColor={color}
        showInfo={false}
        size="small"
        className="m-0"
      />
    </div>
  );
};
