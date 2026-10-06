import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Tabs } from "@/components/ui/Tabs";
import { Spin } from "@/components/ui/Spin";
import { Icon } from "@/components/ui/Icon";
import { useProfile } from "@/modules/students/features/profile/hooks/useProfile";
import { ProfileHeaderCard } from "@/modules/students/features/profile/components/ProfileHeaderCard";
import { ProfileBasicInfoTab } from "@/modules/students/features/profile/components/ProfileBasicInfoTab";
import { ProfileAcademicTab } from "@/modules/students/features/profile/components/ProfileAcademicTab";
import { ProfileGuardiansTab } from "@/modules/students/features/profile/components/ProfileGuardiansTab";
import { ProfileHealthTab } from "@/modules/students/features/profile/components/ProfileHealthTab";

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation(["navigation", "card", "common", "input"]);
  const { profile, loading, updateBasicInfo, updateAvatar } = useProfile();
  const [activeTab, setActiveTab] = useState<string>("basic");

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: "basic",
      label: (
        <span className="inline-flex items-center gap-2 font-medium text-xs sm:text-sm">
          <Icon name="user" size={15} />
          <span>{t("card:profile.tabs.personal")}</span>
        </span>
      ),
      children: (
        <div className="pt-2">
          <ProfileBasicInfoTab
            personalInfo={profile.personalInfo}
            onSave={updateBasicInfo}
          />
        </div>
      ),
    },
    {
      key: "academic",
      label: (
        <span className="inline-flex items-center gap-2 font-medium text-xs sm:text-sm">
          <Icon name="academic" size={15} />
          <span>{t("card:profile.tabs.academic")}</span>
        </span>
      ),
      children: (
        <div className="pt-2">
          <ProfileAcademicTab academicInfo={profile.academicInfo} />
        </div>
      ),
    },
    {
      key: "guardians",
      label: (
        <span className="inline-flex items-center gap-2 font-medium text-xs sm:text-sm">
          <Icon name="users" size={15} />
          <span>{t("card:profile.tabs.guardians")}</span>
        </span>
      ),
      children: (
        <div className="pt-2">
          <ProfileGuardiansTab guardians={profile.guardians} />
        </div>
      ),
    },
    {
      key: "health",
      label: (
        <span className="inline-flex items-center gap-2 font-medium text-xs sm:text-sm">
          <Icon name="heart" size={15} />
          <span>{t("card:profile.tabs.health")}</span>
        </span>
      ),
      children: (
        <div className="pt-2">
          <ProfileHealthTab healthRecord={profile.healthRecord} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("navigation:breadcrumb.home")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="user" size={13} className="text-blue-600 shrink-0" />
                  <span>{t("navigation:breadcrumb.profile")}</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
                {t("navigation:pageTitle.profile")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              {t("navigation:pageSubtitle.profile")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Profile Header Card */}
      <div>
        <ProfileHeaderCard
          profile={profile}
          onUpdateAvatar={updateAvatar}
        />
      </div>

      {/* 4. Tab Container */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="line"
        />
      </div>
    </div>
  );
};
