import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";

interface BannerAcademicBadgesProps {
  currentSemester?: string;
  academicYear?: string;
  classNameDisplay?: string;
  studentCode?: string;
}

/**
 * BannerAcademicBadges component displays academic metadata chips
 * including semester, academic year, current week, and student class.
 */
export const BannerAcademicBadges: React.FC<BannerAcademicBadgesProps> = ({
  currentSemester,
  academicYear,
  classNameDisplay,
  studentCode,
}) => {
  const { t } = useTranslation(["navigation"]);

  const semesterText = currentSemester || t("navigation:currentSemester");
  const academicYearText = academicYear || t("navigation:academicYear");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center">
        {semesterText} <Icon name="dot" size={15} className="text-white" /> {academicYearText}
      </span>
      {classNameDisplay && (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-md border border-white/25">
          {classNameDisplay}
        </span>
      )}
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-md border border-white/25">
        {t("navigation:studentCode", { code: studentCode })}
      </span>
    </div>
  );
};
