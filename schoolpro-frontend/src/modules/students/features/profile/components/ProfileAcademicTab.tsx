import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { StudentAcademicInfo } from "@/modules/students/features/profile/types";

interface ProfileAcademicTabProps {
  academicInfo: StudentAcademicInfo;
}

export const ProfileAcademicTab: React.FC<ProfileAcademicTabProps> = ({
  academicInfo,
}) => {
  const { t } = useTranslation(["card", "input"]);
  const { homeroomTeacher } = academicInfo;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="academic" size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
              {t("card:profile.sections.academic")}
            </h2>
            <Tag color="blue" className="font-bold text-xs px-2.5 py-0.5 m-0">
              {academicInfo.className}
            </Tag>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("card:profile.sections.academicDesc")}
          </p>
        </div>
      </div>

      {/* Class & Academic Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
          <span className="text-slate-400 font-medium">{t("input:labels.className")}</span>
          <p className="font-bold text-slate-800 text-sm mb-0">
            Lớp {academicInfo.className} ({academicInfo.gradeLevel})
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
          <span className="text-slate-400 font-medium">{t("card:profile.academicSummary.schoolName")}</span>
          <p className="font-bold text-slate-800 text-sm mb-0 truncate" title={academicInfo.schoolName}>
            {academicInfo.schoolName}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
          <span className="text-slate-400 font-medium">{t("input:labels.academicYear")}</span>
          <p className="font-bold text-slate-800 text-sm mb-0">
            {academicInfo.academicYear}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
          <span className="text-slate-400 font-medium">{t("card:profile.academicSummary.semester")}</span>
          <p className="font-bold text-slate-800 text-sm mb-0">
            {academicInfo.semester || t("card:profile.academicSummary.defaultSemester")}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
          <span className="text-slate-400 font-medium">{t("input:labels.classroom")}</span>
          <p className="font-bold text-slate-800 text-sm mb-0">
            {academicInfo.classroom}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
          <span className="text-slate-400 font-medium">{t("input:labels.admissionDate")}</span>
          <p className="font-bold text-slate-800 text-sm mb-0">
            {academicInfo.admissionDate}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
          <span className="text-slate-400 font-medium">{t("input:labels.graduationDate")}</span>
          <p className="font-bold text-slate-800 text-sm mb-0">
            {academicInfo.graduationDate || "—"}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
          <span className="text-slate-400 font-medium">{t("input:labels.boarding")}</span>
          <p className="font-bold text-slate-800 text-sm mb-0">
            {academicInfo.isBoarder ? t("card:profile.boarder") : t("card:profile.dayStudent")}
          </p>
        </div>
      </div>

      {/* Homeroom Teacher Details Section */}
      <div className="rounded-xl border border-[#f0f0f0] p-5 bg-slate-50/50 space-y-3">
        <h4 className="text-sm font-bold text-slate-800 mb-0 flex items-center gap-2">
          <Icon name="user" size={16} className="text-blue-600" />
          <span>{t("card:profile.homeroomTeacher")}</span>
        </h4>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-[#f0f0f0] rounded-xl gap-4 mt-3">
          <div className="space-y-1">
            <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
              {homeroomTeacher.subject}
            </span>
            <h5 className="text-base font-bold text-slate-900 mb-0">
              {homeroomTeacher.name}
            </h5>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <a
              href={`tel:${homeroomTeacher.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline"
            >
              <Icon name="phone" size={13} />
              <span>{homeroomTeacher.phone}</span>
            </a>
            <span className="text-slate-300">•</span>
            <a
              href={`mailto:${homeroomTeacher.email}`}
              className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-blue-600"
            >
              <Icon name="mail" size={13} />
              <span>{homeroomTeacher.email}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
