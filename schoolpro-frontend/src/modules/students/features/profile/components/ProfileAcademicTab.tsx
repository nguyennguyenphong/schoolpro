import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { StudentAcademicInfo } from "@/modules/students/features/profile/types";

interface ProfileAcademicTabProps {
  academicInfo: StudentAcademicInfo;
}

export const ProfileAcademicTab: React.FC<ProfileAcademicTabProps> = ({
  academicInfo,
}) => {
  const { t } = useTranslation(["input"]);
  const { homeroomTeacher } = academicInfo;

  return (
    <div className="space-y-6">
      {/* Class & School Details */}
      <Card className="rounded-2xl border-slate-200 shadow-xs p-6 bg-white space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-0.5">
              Học vụ & Biên chế Lớp học
            </h3>
            <p className="text-xs text-slate-400 mb-0">
              {academicInfo.schoolName} • Niên khóa 2026 - 2029
            </p>
          </div>
          <Tag color="blue" className="font-bold text-xs px-3 py-1">
            {academicInfo.className}
          </Tag>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.className")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              Lớp {academicInfo.className} ({academicInfo.gradeLevel})
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.classroom")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              {academicInfo.classroom}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.academicYear")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              {academicInfo.academicYear}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.admissionDate")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              {academicInfo.admissionDate}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.graduationDate")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              {academicInfo.graduationDate || "Dự kiến 2029"}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.boarding")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              {academicInfo.isBoarder ? "Nội trú" : "Ngoại trú / Đi về"}
            </p>
          </div>
        </div>
      </Card>

      {/* Homeroom Teacher Details Card */}
      <Card className="rounded-2xl border-slate-200 shadow-xs p-6 bg-white space-y-4">
        <h4 className="text-sm font-bold text-slate-800 mb-0 flex items-center gap-2">
          <Icon name="user" size={16} className="text-blue-600" />
          <span>Giáo viên chủ nhiệm lớp</span>
        </h4>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl gap-4">
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
      </Card>
    </div>
  );
};
