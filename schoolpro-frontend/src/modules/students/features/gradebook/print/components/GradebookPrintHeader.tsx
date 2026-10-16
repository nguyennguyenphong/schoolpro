import React from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { GradebookPrintStudentProfile } from "@/modules/students/features/gradebook/print/hooks";

interface GradebookPrintHeaderProps {
  profile: GradebookPrintStudentProfile;
}

export const GradebookPrintHeader: React.FC<GradebookPrintHeaderProps> = ({ profile }) => {
  const { t, i18n } = useTranslation(["card"]);
  const now = dayjs();
  const currentLang = i18n.language || "vi";

  const adminDateStr =
    currentLang === "vi"
      ? `Hà Nội, ngày ${now.format("DD")} tháng ${now.format("MM")} năm ${now.format("YYYY")}`
      : currentLang === "en"
      ? `Hanoi, ${now.format("MMMM DD, YYYY")}`
      : currentLang === "ja"
      ? `ハノイ、${now.format("YYYY年MM月DD日")}`
      : currentLang === "ko"
      ? `하노이, ${now.format("YYYY년 MM월 DD일")}`
      : `河内，${now.format("YYYY年MM月DD日")}`;

  return (
    <div
      className="text-black select-text"
      style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}
    >
      {/* 1. Official National & Authority Header Table */}
      <table className="w-full border-collapse border-none mb-2">
        <tbody>
          <tr>
            {/* Left Column: Direct Supervising Ministry & School Name */}
            <td className="w-[45%] text-center align-top p-0">
              <div className="text-[11.5pt] uppercase tracking-wide text-black font-normal leading-tight">
                {t("card:gradebook.print.ministry")}
              </div>
              <div className="text-[11.5pt] font-bold uppercase tracking-tight text-black mt-0.5 leading-tight">
                {profile.schoolName || t("card:gradebook.print.school")}
              </div>
              <div className="w-28 h-px bg-black mx-auto mt-1" />
              <div className="text-[10.5pt] text-black mt-1 font-normal">
                {t("card:gradebook.print.documentNo")}: {profile.studentCode ? `${profile.studentCode}/PĐ-THPT` : "......./PĐ-THPT"}
              </div>
            </td>

            {/* Right Column: National Header & Motto */}
            <td className="w-[55%] text-center align-top p-0">
              <div className="text-[11.5pt] font-bold uppercase tracking-wide text-black leading-tight">
                {t("card:gradebook.print.nationalHeader")}
              </div>
              <div className="text-[12.5pt] font-bold text-black mt-0.5 leading-tight">
                {t("card:gradebook.print.nationalMotto")}
              </div>
              <div className="w-40 h-px bg-black mx-auto mt-1" />
              <div className="text-[11.5pt] italic text-black mt-1 font-normal">
                {adminDateStr}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 2. Official Document Title & Metadata */}
      <div className="text-center mt-3 mb-2.5">
        <h1
          className="text-[15pt] font-bold uppercase text-black tracking-normal mb-0.5"
          style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}
        >
          {t("card:gradebook.print.title")}
        </h1>
        <div className="text-[11pt] italic text-black font-normal">
          {t("card:gradebook.print.decreeNote")}
        </div>
        <div className="text-[12pt] font-bold text-black mt-1">
          {t("card:gradebook.print.semester")}: {profile.semester} — {t("card:gradebook.print.academicYear")}: {profile.academicYear}
        </div>
      </div>
    </div>
  );
};
