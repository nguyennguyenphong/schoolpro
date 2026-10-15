import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";

interface HomeroomTeacherBadgeProps {
  teacherName?: string;
  className?: string;
}

/**
 * HomeroomTeacherBadge component displays the assigned homeroom teacher
 * with an accessible icon and professional glassmorphic card design.
 */
export const HomeroomTeacherBadge: React.FC<HomeroomTeacherBadgeProps> = ({
  teacherName,
  className = "",
}) => {
  const { t } = useTranslation(["input"]);
  const displayName = teacherName || "Cô Nguyễn Thị Mai Hoa";

  return (
    <div
      className={`flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 transition-all shadow-xs ${className}`}
      data-testid="homeroom-teacher-badge"
    >
      <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
        <Icon name="userCheck" size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <span className="block text-[11px] text-blue-100 font-medium uppercase tracking-wider">
          {t("input:labels.homeroomTeacher")}
        </span>
        <span className="block text-sm sm:text-base font-bold text-white truncate">
          {displayName}
        </span>
      </div>
    </div>
  );
};
