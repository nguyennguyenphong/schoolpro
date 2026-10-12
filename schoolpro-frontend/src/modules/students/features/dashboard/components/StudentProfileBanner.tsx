import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { StudentProfileInfo, StudentAcademicOverview } from "@/modules/students/features/dashboard/types";

interface StudentProfileBannerProps {
  profile: StudentProfileInfo;
  overview: StudentAcademicOverview;
}

export const StudentProfileBanner: React.FC<StudentProfileBannerProps> = ({
  profile,
  overview,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#f0f0f0] p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Avatar & Primary Info */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm border border-blue-500/20">
              {profile.fullName.split(" ").pop()?.charAt(0) || "H"}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Trạng thái: Đang theo học" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-0">
                {profile.fullName}
              </h2>
              <Tag color="blue" className="m-0 font-mono text-xs font-semibold px-2 py-0.5 rounded-xl">
                {profile.studentCode}
              </Tag>
              <Tag color="success" className="m-0 text-xs font-semibold px-2 py-0.5 rounded-xl">
                {profile.status}
              </Tag>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>{profile.gender}</span>
              <span>•</span>
              <span>Sinh ngày: <strong className="text-slate-700 font-medium">{profile.dob}</strong></span>
              <span>•</span>
              <span>Niên khóa: <strong className="text-slate-700 font-medium">2024 - 2027</strong></span>
            </div>

            {/* Awards Tags */}
            {overview.awards.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {overview.awards.map((award, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-xl"
                  >
                    <Icon name="check" size={12} className="text-amber-600 shrink-0" />
                    <span>{award}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Key Class & Homeroom Information */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 text-xs">
          {/* Box 1: Class & Stream */}
          <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-[#f0f0f0]/80">
            <div className="text-[11px] text-slate-400 font-medium mb-0.5 flex items-center gap-1">
              <Icon name="book" size={12} className="text-slate-400 shrink-0" />
              <span>Lớp & Khối</span>
            </div>
            <div className="font-bold text-slate-800 text-sm">{profile.className}</div>
            <div className="text-[11px] text-slate-500 truncate" title={profile.stream}>
              {profile.stream}
            </div>
          </div>

          {/* Box 2: Homeroom Teacher */}
          <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-[#f0f0f0]/80">
            <div className="text-[11px] text-slate-400 font-medium mb-0.5 flex items-center gap-1">
              <Icon name="user" size={12} className="text-slate-400 shrink-0" />
              <span>Giáo viên Chủ nhiệm</span>
            </div>
            <div className="font-bold text-slate-800 text-sm truncate" title={profile.homeroomTeacher}>
              {profile.homeroomTeacher}
            </div>
            <div className="text-[11px] text-slate-500">{profile.teacherPhone}</div>
          </div>

          {/* Box 3: Room & School */}
          <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-[#f0f0f0]/80 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-400 font-medium mb-0.5 flex items-center gap-1">
              <Icon name="map-pin" size={12} className="text-slate-400 shrink-0" />
              <span>Phòng sinh hoạt</span>
            </div>
            <div className="font-bold text-slate-800 text-sm">{profile.room}</div>
            <div className="text-[11px] text-slate-500 truncate" title={profile.schoolName}>
              {profile.schoolName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
