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
  const { t, i18n } = useTranslation(["card"]);
  const now = dayjs();
  const currentLang = i18n.language || "vi";

  const adminDateStr =
    currentLang === "vi"
      ? `Ngày ${now.format("DD")} tháng ${now.format("MM")} năm ${now.format("YYYY")}`
      : currentLang === "en"
      ? `${now.format("MMMM DD, YYYY")}`
      : `${now.format("YYYY/MM/DD")}`;

  const signatureCode = digitalSignature;
  const nowStr = verifiedAt || dayjs().format("DD/MM/YYYY HH:mm");

  return (
    <div
      className="w-full my-4 text-black page-break-inside-avoid"
      style={{
        fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* 3-column Signatures block */}
      <table className="w-full border-collapse border-none text-center">
        <tbody>
          <tr>
            <td className="w-1/3 align-top p-1">
              <div className="font-bold uppercase text-[11.5pt] leading-tight">
                {t("card:gradebook.print.signatureStudent")}
              </div>
              <div className="text-[10pt] italic text-slate-700 print:text-black mt-0.5">
                {t("card:gradebook.print.signNote")}
              </div>
              <div className="h-14" />
              <div className="font-bold uppercase text-[11.5pt] tracking-wide">
                {profile.studentName}
              </div>
            </td>

            <td className="w-1/3 align-top p-1">
              <div className="font-bold uppercase text-[11.5pt] leading-tight">
                Ý KIẾN CỦA PHỤ HUYNH
              </div>
              <div className="text-[10pt] italic text-slate-700 print:text-black mt-0.5">
                {t("card:gradebook.print.signNote")}
              </div>
              <div className="h-14" />
              <div className="text-[10pt] text-slate-400 print:text-transparent">
                (Ký và ghi rõ họ tên)
              </div>
            </td>

            <td className="w-1/3 align-top p-1">
              <div className="text-[10.5pt] italic text-slate-800 print:text-black mb-0.5">
                {adminDateStr}
              </div>
              <div className="font-bold uppercase text-[11.5pt] leading-tight">
                {t("card:gradebook.print.signatureTeacher")}
              </div>
              <div className="text-[10pt] italic text-slate-700 print:text-black mt-0.5">
                {t("card:gradebook.print.signNote")}
              </div>
              <div className="h-14" />
              <div className="font-bold text-[11.5pt]">
                {profile.homeroomTeacher}
              </div>
            </td>
          </tr>

          {/* Principal confirmation block */}
          <tr>
            <td colSpan={3} className="pt-4 text-center">
              <div className="font-bold uppercase text-[11.5pt] leading-tight">
                {t("card:gradebook.print.signaturePrincipal")}
              </div>
              <div className="text-[10pt] italic text-slate-700 print:text-black mt-0.5">
                {t("card:gradebook.print.sealNote")}
              </div>
              <div className="h-16 flex items-center justify-center">
                <div className="border border-dashed border-slate-400 print:border-black rounded-xs px-3 py-1 text-[9.5pt] text-slate-500 print:text-black uppercase tracking-wider">
                  [Đóng dấu nhà trường]
                </div>
              </div>
              <div className="font-bold text-[11.5pt]">
                {profile.principalName}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer bar: Mã chứng thực tay trái, Ngày tạo tay phải */}
      <div className="mt-6 pt-2 border-t border-black text-[9pt] text-slate-700 print:text-black flex justify-between items-center italic">
        <div className="text-left">
          {signatureCode ? (
            <span>
              {t("card:gradebook.print.authCodeLabel", { defaultValue: "Mã chứng thực" })}: {signatureCode}
            </span>
          ) : null}
        </div>
        <div className="text-right">
          <span>
            {t("card:gradebook.print.createdDateLabel", { defaultValue: "Ngày tạo" })}: {nowStr}
          </span>
        </div>
      </div>
    </div>
  );
};
