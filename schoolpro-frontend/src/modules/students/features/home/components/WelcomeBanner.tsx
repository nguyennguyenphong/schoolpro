import React from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/i18n";
import type { StudentProfile } from "@/modules/students/features/home/types";
import { BannerAcademicBadges } from "@/modules/students/features/home/components/BannerAcademicBadges";
import { HomeroomTeacherBadge } from "@/modules/students/features/home/components/HomeroomTeacherBadge";

interface WelcomeBannerProps {
  profile?: StudentProfile;
}

/**
 * WelcomeBanner component greets the student and organizes essential status information:
 * - Current academic semester, academic year, and week
 * - Student name & class
 * - Homeroom teacher information
 * - Formatted date with active indicator
 * - Quick shortcut to view student timetable
 */
export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ profile }) => {
  const { t, i18n } = useTranslation(["navigation", "button", "common", "input"]);

  const studentName = profile?.fullName || "SchoolPro Student";
  const classDisplayName =
    profile?.className ? `Lớp ${profile.className}` : profile?.major || "Lớp 10A1";
  const homeroomTeacher =
    profile?.homeroomTeacher ||
    profile?.homeroomTeacherName ||
    "SchoolPro Homeroom Teacher";

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
    <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-md shadow-blue-500/15 border border-blue-500/40">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left column: Academic status, Welcome greeting, and Current Date */}
        <div className="space-y-3">
          <BannerAcademicBadges
            currentSemester={profile?.currentSemester}
            academicYear={profile?.academicYear}
            classNameDisplay={classDisplayName}
          />

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-0">
            {t("navigation:welcome", {
              name: studentName,
            })}
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm mb-0 flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {todayFormatted}
          </p>
        </div>

        {/* Right column: Homeroom Teacher information card and Schedule action */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-3.5">
          <HomeroomTeacherBadge teacherName={homeroomTeacher} />
        </div>
      </div>
    </div>
  );
};
