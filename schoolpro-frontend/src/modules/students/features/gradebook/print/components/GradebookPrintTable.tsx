import React from "react";
import { useTranslation } from "react-i18next";
import type { SubjectGradeItem } from "@/modules/students/features/gradebook/types";

interface GradebookPrintTableProps {
  grades: SubjectGradeItem[];
}

export const GradebookPrintTable: React.FC<GradebookPrintTableProps> = ({ grades }) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="w-full overflow-visible">
      <table className="w-full text-xs text-left border-collapse border border-slate-800">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-800">
            <th className="py-2 px-1.5 w-10 border border-slate-800">
              {t("card:gradebook.transcriptModal.stt")}
            </th>
            <th className="py-2 px-2 w-20 border border-slate-800">
              {t("card:gradebook.print.subjectCodeColumn")}
            </th>
            <th className="py-2 px-3 text-left border border-slate-800">
              {t("card:gradebook.table.subject")}
            </th>
            <th className="py-2 px-2 w-32 border border-slate-800">
              {t("card:gradebook.table.regularScores")}
            </th>
            <th className="py-2 px-2 w-16 border border-slate-800">
              {t("card:gradebook.table.midtermScore")}
            </th>
            <th className="py-2 px-2 w-16 border border-slate-800">
              {t("card:gradebook.table.finalScore")}
            </th>
            <th className="py-2 px-2 w-16 border border-slate-800">
              {t("card:gradebook.table.averageScore")}
            </th>
            <th className="py-2 px-2 w-24 border border-slate-800">
              {t("card:gradebook.table.gradeLevel")}
            </th>
            <th className="py-2 px-3 text-left border border-slate-800">
              {t("card:gradebook.table.teacherComment")}
            </th>
          </tr>
        </thead>
        <tbody>
          {grades.map((item, idx) => {
            const isFeedback = item.evaluationType === "feedback";
            const regularScoresText = item.regularScores?.length
              ? item.regularScores.map((s) => s.score.toFixed(1)).join("   ")
              : "—";
            const midtermText = item.midtermScore ? item.midtermScore.score.toFixed(1) : "—";
            const finalText = item.finalScore ? item.finalScore.score.toFixed(1) : "—";
            const avgText = isFeedback
              ? item.feedbackResult === "pass"
                ? t("card:gradebook.levels.pass")
                : t("card:gradebook.levels.fail")
              : typeof item.averageScore === "number"
              ? item.averageScore.toFixed(1)
              : "—";

            const levelText = isFeedback
              ? item.feedbackResult === "pass"
                ? t("card:gradebook.levels.pass")
                : t("card:gradebook.levels.fail")
              : typeof item.averageScore === "number"
              ? item.averageScore >= 8.0
                ? t("card:gradebook.levels.excellent")
                : item.averageScore >= 6.5
                ? t("card:gradebook.levels.good")
                : t("card:gradebook.levels.average")
              : "—";

            return (
              <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-50/50">
                <td className="py-2 px-1.5 text-center font-medium border border-slate-800">
                  {idx + 1}
                </td>
                <td className="py-2 px-2 text-center font-mono font-semibold text-slate-800 border border-slate-800">
                  {item.code}
                </td>
                <td className="py-2 px-3 font-bold text-slate-900 border border-slate-800">
                  {item.name}
                </td>
                <td className="py-2 px-2 text-center text-slate-800 border border-slate-800 whitespace-nowrap">
                  {isFeedback ? "—" : regularScoresText}
                </td>
                <td className="py-2 px-2 text-center font-medium text-slate-800 border border-slate-800">
                  {isFeedback ? "—" : midtermText}
                </td>
                <td className="py-2 px-2 text-center font-medium text-slate-800 border border-slate-800">
                  {isFeedback ? "—" : finalText}
                </td>
                <td className="py-2 px-2 text-center font-bold text-slate-900 border border-slate-800">
                  {avgText}
                </td>
                <td className="py-2 px-2 text-center font-semibold text-slate-800 border border-slate-800">
                  {levelText}
                </td>
                <td className="py-2 px-3 text-slate-700 italic border border-slate-800">
                  {item.teacherComment || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
