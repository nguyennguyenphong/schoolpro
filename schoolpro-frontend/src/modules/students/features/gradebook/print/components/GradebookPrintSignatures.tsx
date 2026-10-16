import React from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { GradebookPrintStudentProfile } from "@/modules/students/features/gradebook/print/hooks";

interface GradebookPrintSignaturesProps {
  profile: GradebookPrintStudentProfile;
  digitalSignature?: string;
  verifiedAt?: string;
}

export const GradebookPrintSignatures: React.FC<GradebookPrintSignaturesProps> = ({
  profile,
  digitalSignature,
  verifiedAt,
}) => {
  const { t } = useTranslation(["card"]);
  const nowStr = verifiedAt || dayjs().format("DD/MM/YYYY HH:mm");
  const signatureCode = digitalSignature || "MOET-BGDDT-CERT-2026-X992";

  return (
    <div className="pt-4 space-y-6 text-xs sm:text-sm text-slate-900 page-break-inside-avoid">
      <div className="grid grid-cols-3 gap-4 text-center items-start">
        {/* Student signature */}
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wide">
            {t("card:gradebook.print.signatureStudent")}
          </div>
          <div className="text-[11px] italic text-slate-600">
            {t("card:gradebook.print.signNote")}
          </div>
          <div className="h-20" />
          <div className="font-bold uppercase text-slate-900">{profile.studentName}</div>
        </div>

        {/* Homeroom teacher signature */}
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wide">
            {t("card:gradebook.print.signatureTeacher")}
          </div>
          <div className="text-[11px] italic text-slate-600">
            {t("card:gradebook.print.signNote")}
          </div>
          <div className="h-20" />
          <div className="font-bold text-slate-900">{profile.homeroomTeacher}</div>
        </div>

        {/* Principal signature */}
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wide">
            {t("card:gradebook.print.signaturePrincipal")}
          </div>
          <div className="text-[11px] italic text-slate-600">
            {t("card:gradebook.print.sealNote")}
          </div>
          <div className="h-20 flex items-center justify-center">
            <div className="border border-dashed border-slate-400 rounded-sm px-2 py-1 text-[10px] text-slate-500 uppercase tracking-widest">
              [Dấu xác nhận]
            </div>
          </div>
          <div className="font-bold text-slate-900">{profile.principalName}</div>
        </div>
      </div>

      {/* Audit trail footer */}
      <div className="pt-6 border-t border-slate-300 text-[10px] sm:text-[11px] text-slate-500 text-center">
        {t("card:gradebook.print.auditFooter", {
          signature: signatureCode,
          time: nowStr,
        })}
      </div>
    </div>
  );
};
