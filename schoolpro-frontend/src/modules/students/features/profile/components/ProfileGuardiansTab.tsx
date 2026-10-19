import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { StudentGuardian } from "@/modules/students/features/profile/types";

interface ProfileGuardiansTabProps {
  guardians: StudentGuardian[];
}

export const ProfileGuardiansTab: React.FC<ProfileGuardiansTabProps> = ({
  guardians,
}) => {
  const { t } = useTranslation(["card", "input"]);

  const getRelationshipLabel = (rel: string) => {
    switch (rel) {
      case "FATHER":
        return "Bố (Father)";
      case "MOTHER":
        return "Mẹ (Mother)";
      default:
        return "Guardian";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="users" size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
              {t("card:profile.sections.guardians")}
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-[#f0f0f0]">
              {guardians.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("card:profile.sections.guardiansDesc")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guardians.map((g) => (
          <div
            key={g.id}
            className="rounded-xl border border-[#f0f0f0] shadow-2xs p-5 bg-white space-y-3.5 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {getRelationshipLabel(g.relationship)}
                </span>
                <h4 className="text-base font-bold text-slate-900 mb-0 pt-1">
                  {g.fullName}
                </h4>
                <p className="text-xs text-slate-500 mb-0">{g.job || "—"}</p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {g.isPrimaryContact && (
                  <Tag color="cyan" className="font-semibold text-[11px] m-0">
                    {t("card:profile.primaryContact")}
                  </Tag>
                )}
                {g.isParentCommittee && (
                  <Tag color="gold" className="font-semibold text-[11px] m-0">
                    {t("card:profile.parentCommittee")}
                  </Tag>
                )}
                {g.isEmergencyContact && (
                  <Tag color="rose" className="font-semibold text-[11px] m-0">
                    {t("card:profile.emergencyContact")}
                  </Tag>
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Icon name="phone" size={14} className="text-slate-400 shrink-0" />
                <span className="text-slate-400">{t("input:labels.phone")}:</span>
                <a
                  href={`tel:${g.phone.replace(/\s+/g, "")}`}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {g.phone}
                </a>
              </div>

              {g.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Icon name="mail" size={14} className="text-slate-400 shrink-0" />
                  <span className="text-slate-400">{t("input:labels.email")}:</span>
                  <a
                    href={`mailto:${g.email}`}
                    className="font-medium text-slate-700 hover:text-blue-600"
                  >
                    {g.email}
                  </a>
                </div>
              )}

              {g.workplace && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Icon name="home" size={14} className="text-slate-400 shrink-0" />
                  <span className="text-slate-400">{t("input:labels.workplace")}:</span>
                  <span className="font-medium text-slate-700">{g.workplace}</span>
                </div>
              )}

              {g.address && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Icon name="home" size={14} className="text-slate-400 shrink-0" />
                  <span className="text-slate-400">{t("input:labels.address")}:</span>
                  <span className="font-medium text-slate-700">{g.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
