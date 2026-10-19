import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import type { StudentProfileData } from "@/modules/students/features/profile/types";
import { AvatarUploadModal } from "@/modules/students/features/profile/components/AvatarUploadModal";
import { ProfileAcademicSummaryCard } from "@/modules/students/features/profile/components/ProfileAcademicSummaryCard";

interface ProfileHeaderCardProps {
  profile: StudentProfileData;
  onUpdateAvatar: (url: string) => Promise<void>;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  profile,
  onUpdateAvatar,
}) => {
  const { t } = useTranslation(["card", "button", "input"]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { personalInfo, academicInfo, completionPercentage } = profile;

  return (
    <>
      <Card className="shadow-xs overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Avatar with edit badge & Basic Details */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative inline-block self-start sm:self-auto">
              <Avatar
                size={96}
                src={personalInfo.avatarUrl?.trim() ? personalInfo.avatarUrl : undefined}
                className="ring-4 ring-blue-50 border border-[#f0f0f0] shadow-md"
              />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md ring-2 ring-white transition-all cursor-pointer"
                title={t("button:changeAvatar")}
              >
                <Icon name="settings" size={14} />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-0">
                  {personalInfo.fullName}
                </h1>
                <Tag color="blue" className="font-semibold text-xs px-2.5 py-0.5 m-0">
                  {academicInfo.className}
                </Tag>
                <Tag color="green" className="font-semibold text-xs px-2.5 py-0.5 m-0">
                  {t("card:profile.statusStudying")}
                </Tag>
              </div>
            </div>
          </div>

          {/* Right: Completion Rate */}
          <div className="p-4 bg-slate-50 border border-[#f0f0f0] rounded-xl max-w-xs w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {t("card:profile.completionRate")}
              </span>
              <span className="font-extrabold text-blue-600">
                {completionPercentage}%
              </span>
            </div>
            <Progress
              percent={completionPercentage}
              showInfo={false}
              strokeColor="#2563EB"
              className="m-0"
            />
            <p className="text-[11px] text-slate-400 mb-0">
              {t("card:profile.verifiedNotice")}
            </p>
          </div>
        </div>

        {/* Academic Identity Summary Card */}
        <div className="mt-2 pt-2">
          <ProfileAcademicSummaryCard
            studentCode={personalInfo.studentCode}
            schoolName={academicInfo.schoolName}
            academicYear={academicInfo.academicYear}
            semester={academicInfo.semester}
          />
        </div>
      </Card>

      <AvatarUploadModal
        isOpen={isModalOpen}
        currentAvatarUrl={personalInfo.avatarUrl}
        onClose={() => setIsModalOpen(false)}
        onSelectAvatar={onUpdateAvatar}
      />
    </>
  );
};
