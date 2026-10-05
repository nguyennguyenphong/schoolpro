import React from "react";
import { useTranslation } from "react-i18next";
import { RoleHomePage } from "@/pages/RoleHome";

export const TeacherHomePage: React.FC = () => {
  const { t } = useTranslation(["auth"]);
  return (
    <RoleHomePage
      roleTitle={t("auth:roles.teacher")}
      roleSubtitle={t("auth:roleSubtitles.teacher")}
      roleBadgeColor="#2563EB"
      roleIcon="presentation"
    />
  );
};

export const StaffHomePage: React.FC = () => {
  const { t } = useTranslation(["auth"]);
  return (
    <RoleHomePage
      roleTitle={t("auth:roles.staff")}
      roleSubtitle={t("auth:roleSubtitles.staff")}
      roleBadgeColor="#0D9488"
      roleIcon="settings"
    />
  );
};

export const AdminHomePage: React.FC = () => {
  const { t } = useTranslation(["auth"]);
  return (
    <RoleHomePage
      roleTitle={t("auth:roles.admin")}
      roleSubtitle={t("auth:roleSubtitles.admin")}
      roleBadgeColor="#1E293B"
      roleIcon="lock"
    />
  );
};

export const ParentHomePage: React.FC = () => {
  const { t } = useTranslation(["auth"]);
  return (
    <RoleHomePage
      roleTitle={t("auth:roles.parent")}
      roleSubtitle={t("auth:roleSubtitles.parent")}
      roleBadgeColor="#EA580C"
      roleIcon="userCheck"
    />
  );
};

export const SupervisorHomePage: React.FC = () => {
  const { t } = useTranslation(["auth"]);
  return (
    <RoleHomePage
      roleTitle={t("auth:roles.supervisor")}
      roleSubtitle={t("auth:roleSubtitles.supervisor")}
      roleBadgeColor="#D97706"
      roleIcon="check"
    />
  );
};
