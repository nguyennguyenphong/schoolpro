import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/i18n";
import type { StudentProfile } from "@/modules/students/features/home/types";

interface WelcomeBannerProps {
  profile?: StudentProfile;
  onViewSchedule?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  profile,
  onViewSchedule,
}) => {
  const { t, i18n } = useTranslation(["common", "student"]);

  const studentName = profile?.fullName || "Nguyễn Văn An";
  const currentWeek = profile?.currentWeek || 4;
  const major = profile?.major || "Kỹ thuật Phần mềm";

  const todayFormatted = formatDate(
    new Date(),
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
    i18n.language
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-md shadow-blue-500/15 border border-blue-500/40">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          {/* Academic Info Badges (Bordered) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30">
              {t("student:home.currentSemester")} • {t("student:home.academicYear")}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/25 text-emerald-100 backdrop-blur-md border border-emerald-400/40">
              Tuần học thứ {currentWeek}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md border border-white/20 hidden sm:inline-block">
              {major}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-0">
            {t("student:home.welcome", { name: studentName })}
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm mb-0 flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {todayFormatted}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onViewSchedule}
            className="bg-white/10! hover:bg-white/20! border-white/40! text-white! font-semibold rounded-xl h-11 px-5 shadow-xs transition-all cursor-pointer text-xs sm:text-sm"
          >
            {t("student:schedule.viewFullSchedule")}
          </Button>
        </div>
      </div>
    </div>
  );
};
