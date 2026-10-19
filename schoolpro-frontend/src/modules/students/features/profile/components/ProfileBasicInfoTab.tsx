import React from "react";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";
import { ProfileIdentityCard } from "@/modules/students/features/profile/components/sections/ProfileIdentityCard";
import { ProfileContactCard } from "@/modules/students/features/profile/components/sections/ProfileContactCard";
import { ProfileResidenceCard } from "@/modules/students/features/profile/components/sections/ProfileResidenceCard";
import { ProfileOrganizationCard } from "@/modules/students/features/profile/components/sections/ProfileOrganizationCard";

interface ProfileBasicInfoTabProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
  disabled?: boolean;
}

export const ProfileBasicInfoTab: React.FC<ProfileBasicInfoTabProps> = ({
  personalInfo,
  onSave,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Identity & Account dossier Card */}
      <ProfileIdentityCard
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={disabled}
      />

      {/* 2. Contact details & biography Card */}
      <ProfileContactCard
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={disabled}
      />

      {/* 3. Residence, citizenship & household registry Card */}
      <ProfileResidenceCard
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={disabled}
      />

      {/* 4. Youth affiliations, health insurance & policies Card */}
      <ProfileOrganizationCard
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={disabled}
      />
    </div>
  );
};
