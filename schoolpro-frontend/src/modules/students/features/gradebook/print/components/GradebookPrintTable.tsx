import React from "react";
import { useTranslation } from "react-i18next";
import type { SubjectGradeItem } from "@/modules/students/features/gradebook/types";

interface GradebookPrintTableProps {
  grades: SubjectGradeItem[];
}

export const GradebookPrintTable: React.FC<GradebookPrintTableProps> = ({ grades }) => {
  const { t } = useTranslation(["card"]);

  return (
    <div
      className="w-full my-3 text-black"
      style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}
    >
      <div className="font-bold uppercase text-[11pt] mb-1.5 tracking-wide">
        {t("card:gradebook.print.tableTitle")}:
      </div>

      <table
        className="w-full text-[9.5pt] border-collapse border border-black text-black table-fixed"
        style={{
          width: "100%",
          tableLayout: "fixed",
          borderCollapse: "collapse",
          border: "1px solid #000000",
        }}
      >
        <thead>
          <tr className="bg-slate-100/80 print:bg-transparent font-bold text-center border-b border-black">
            <th
              rowSpan={2}
              style={{ width: "4%", border: "1px solid #000000", padding: "4px 1px" }}
              className="text-center font-bold align-middle"
            >
              {t("card:gradebook.transcriptModal.stt")}
            </th>
            <th
              rowSpan={2}
              style={{ width: "23%", border: "1px solid #000000", padding: "4px 4px" }}
              className="text-left font-bold align-middle"
            >
              {t("card:gradebook.table.subject")}
            </th>
            <th
              colSpan={4}
              style={{ width: "22%", border: "1px solid #000000", padding: "3px 2px" }}
              className="text-center font-bold"
            >
              {t("card:gradebook.table.regularScores")}
            </th>
            <th
              rowSpan={2}
              style={{ width: "8%", border: "1px solid #000000", padding: "4px 2px" }}
              className="text-center font-bold align-middle"
            >
              {t("card:gradebook.table.midtermScore")}
            </th>
            <th
              rowSpan={2}
              style={{ width: "8%", border: "1px solid #000000", padding: "4px 2px" }}
              className="text-center font-bold align-middle"
            >
              {t("card:gradebook.table.finalScore")}
            </th>
            <th
              rowSpan={2}
              style={{ width: "8%", border: "1px solid #000000", padding: "4px 2px" }}
              className="text-center font-bold align-middle"
            >
              {t("card:gradebook.table.averageScore")}
            </th>
            <th
              rowSpan={2}
              style={{ width: "9%", border: "1px solid #000000", padding: "4px 2px" }}
              className="text-center font-bold align-middle"
            >
              {t("card:gradebook.table.gradeLevel")}
            </th>
            <th
              rowSpan={2}
              style={{ width: "18%", border: "1px solid #000000", padding: "4px 4px" }}
              className="text-left font-bold align-middle"
            >
              {t("card:gradebook.table.teacherComment")}
            </th>
          </tr>

          {/* Sub-row for 4 separate regular scores */}
          <tr className="bg-slate-100/80 print:bg-transparent font-bold text-center border-b border-black">
            <th
              style={{ width: "5.5%", border: "1px solid #000000", padding: "3px 1px" }}
              className="text-center font-bold text-[9pt]"
            >
              {t("card:gradebook.table.regularScore1")}
            </th>
            <th
              style={{ width: "5.5%", border: "1px solid #000000", padding: "3px 1px" }}
              className="text-center font-bold text-[9pt]"
            >
              {t("card:gradebook.table.regularScore2")}
            </th>
            <th
              style={{ width: "5.5%", border: "1px solid #000000", padding: "3px 1px" }}
              className="text-center font-bold text-[9pt]"
            >
              {t("card:gradebook.table.regularScore3")}
            </th>
            <th
              style={{ width: "5.5%", border: "1px solid #000000", padding: "3px 1px" }}
              className="text-center font-bold text-[9pt]"
            >
              {t("card:gradebook.table.regularScore4")}
            </th>
          </tr>

          {/* Official Vietnamese table column numbering (1)..(11) */}
          <tr className="text-center text-[8.5pt] italic text-slate-700 print:text-black border-b border-black bg-slate-50 print:bg-transparent">
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(1)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(2)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(3)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(4)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(5)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(6)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(7)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(8)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(9)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(10)</td>
            <td style={{ border: "1px solid #000000", padding: "1px 0" }}>(11)</td>
          </tr>
        </thead>
        <tbody>
          {grades.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                className="text-center py-4 italic text-slate-500 print:text-black"
                style={{ border: "1px solid #000000" }}
              >
                {t("card:gradebook.empty.noDataTitle")}
              </td>
            </tr>
          ) : (
            grades.map((item, idx) => {
            const isFeedback = item.evaluationType === "feedback";
            const score1 =
              !isFeedback && item.regularScores && item.regularScores[0]
                ? item.regularScores[0].score.toFixed(1)
                : "—";
            const score2 =
              !isFeedback && item.regularScores && item.regularScores[1]
                ? item.regularScores[1].score.toFixed(1)
                : "—";
            const score3 =
              !isFeedback && item.regularScores && item.regularScores[2]
                ? item.regularScores[2].score.toFixed(1)
                : "—";
            const score4 =
              !isFeedback && item.regularScores && item.regularScores[3]
                ? item.regularScores[3].score.toFixed(1)
                : "—";

            const midtermText =
              !isFeedback && item.midtermScore ? item.midtermScore.score.toFixed(1) : "—";
            const finalText =
              !isFeedback && item.finalScore ? item.finalScore.score.toFixed(1) : "—";
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
              <tr
                key={item.id}
                className="border-b border-black"
                style={{
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                }}
              >
                <td
                  style={{ border: "1px solid #000000", padding: "3px 1px" }}
                  className="text-center"
                >
                  {idx + 1}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 4px" }}
                  className="font-bold text-left"
                >
                  {item.name}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 1px" }}
                  className="text-center whitespace-nowrap"
                >
                  {score1}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 1px" }}
                  className="text-center whitespace-nowrap"
                >
                  {score2}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 1px" }}
                  className="text-center whitespace-nowrap"
                >
                  {score3}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 1px" }}
                  className="text-center whitespace-nowrap"
                >
                  {score4}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 1px" }}
                  className="text-center whitespace-nowrap"
                >
                  {midtermText}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 1px" }}
                  className="text-center whitespace-nowrap"
                >
                  {finalText}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 1px" }}
                  className="text-center font-bold whitespace-nowrap"
                >
                  {avgText}
                </td>
                <td
                  style={{ border: "1px solid #000000", padding: "3px 2px" }}
                  className="text-center font-semibold"
                >
                  {levelText}
                </td>
                <td
                  style={{
                    border: "1px solid #000000",
                    padding: "3px 4px",
                    wordBreak: "break-word",
                  }}
                  className="text-left italic"
                >
                  {item.teacherComment || "—"}
                </td>
              </tr>
            );
          }))}
        </tbody>
      </table>
    </div>
  );
};
