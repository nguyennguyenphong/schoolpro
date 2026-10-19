import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useProfile } from "@/modules/students/features/profile/hooks/useProfile";
import { useProfileTabs } from "@/modules/students/features/profile/hooks/useProfileTabs";
import { ProfileHeaderCard } from "@/modules/students/features/profile/components/ProfileHeaderCard";
import { ProfileTabs } from "@/modules/students/features/profile/components/ProfileTabs";
import { ProfileBasicInfoTab } from "@/modules/students/features/profile/components/ProfileBasicInfoTab";
import { ProfileAcademicTab } from "@/modules/students/features/profile/components/ProfileAcademicTab";
import { ProfileGuardiansTab } from "@/modules/students/features/profile/components/ProfileGuardiansTab";
import { ProfileHealthTab } from "@/modules/students/features/profile/components/ProfileHealthTab";

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation(["navigation", "card", "common", "input"]);
  const { activeTab, setTab } = useProfileTabs();

  const {
    profile,
    loading,
    updating,
    updateBasicInfo,
    updateAvatar,
  } = useProfile();

  const guardiansCount = profile?.guardians?.length ?? 0;

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2x">
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

      {/* 2. Profile Header Overview Card */}
      {profile && (
        <ProfileHeaderCard
          profile={profile}
          onUpdateAvatar={updateAvatar}
        />
      )}

      {/* 3. Separate Tab Navigation Bar inside Card component */}
      <div className="mb-6 mt-4">
        <Card className="shadow-2xs">
          <ProfileTabs
            activeTab={activeTab}
            guardiansCount={guardiansCount}
            onTabChange={setTab}
          />
        </Card>
      </div>

      {/* 4. Tab Content Section */}
      {activeTab === "personal" ? (
        loading && !profile ? (
          <Card loading className="shadow-2xs" />
        ) : (
          profile && (
            <ProfileBasicInfoTab
              personalInfo={profile.personalInfo}
              onSave={updateBasicInfo}
              disabled={updating}
            />
          )
        )
      ) : (
        <Card
          loading={loading && !profile}
          className="shadow-2xs"
        >
          {profile && activeTab === "academic" && (
            <ProfileAcademicTab academicInfo={profile.academicInfo} />
          )}

          {profile && activeTab === "guardians" && (
            <ProfileGuardiansTab guardians={profile.guardians} />
          )}

          {profile && activeTab === "health" && (
            <ProfileHealthTab
              healthRecord={profile.healthRecord}
              onSave={updateBasicInfo}
            />
          )}
        </Card>
      )}
    </div>
  );
};
