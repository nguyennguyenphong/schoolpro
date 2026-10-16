import React from "react";
import { useTranslation } from "react-i18next";
import type { GradebookPrintStudentProfile } from "@/modules/students/features/gradebook/print/hooks";

interface GradebookPrintStudentInfoProps {
  profile: GradebookPrintStudentProfile;
}

export const GradebookPrintStudentInfo: React.FC<GradebookPrintStudentInfoProps> = ({ profile }) => {
  const { t } = useTranslation(["card"]);

  return (
    <div
      className="text-black text-[11.5pt] leading-[1.5] my-2.5"
      style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}
    >
      {/* Salutation line like an official school report / application */}
      <div className="mb-1.5 italic">
        Kính gửi: <span className="font-bold not-italic">Quý Cha Mẹ học sinh và em {profile.studentName}</span>
      </div>

      <table className="w-full border-collapse border-none">
        <tbody>
          <tr>
            <td className="w-[55%] py-0.5 pl-0">
              {t("card:gradebook.print.studentName")}{" "}
              <strong className="uppercase tracking-wide">{profile.studentName}</strong>
            </td>
            <td className="w-[45%] py-0.5 pl-0">
              {t("card:gradebook.print.studentCode")}{" "}
              <strong className="tracking-wide font-mono">{profile.studentCode}</strong>
            </td>
          </tr>
          <tr>
            <td className="py-0.5 pl-0">
              {t("card:gradebook.print.className")}{" "}
              <strong>{profile.className}</strong>
            </td>
            <td className="py-0.5 pl-0">
              Khóa học: <strong>2024 - 2027</strong>
            </td>
          </tr>
          <tr>
            <td className="py-0.5 pl-0" colSpan={2}>
              {t("card:gradebook.print.homeroomTeacher")}{" "}
              <strong>{profile.homeroomTeacher}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
