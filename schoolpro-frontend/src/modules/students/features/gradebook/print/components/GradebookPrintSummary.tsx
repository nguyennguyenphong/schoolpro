import React from "react";
import { useTranslation } from "react-i18next";
import type { GradeSummary } from "@/modules/students/features/gradebook/types";

interface GradebookPrintSummaryProps {
  summary: GradeSummary | null;
}

export const GradebookPrintSummary: React.FC<GradebookPrintSummaryProps> = ({ summary }) => {
  const { t } = useTranslation(["card"]);

  if (!summary) return null;

  return (
    <div
      className="w-full my-3 text-black text-[11pt] leading-[1.5] page-break-inside-avoid"
      style={{
        fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      <div className="font-bold uppercase text-[11.5pt] mb-1.5 tracking-wide">
        {t("card:gradebook.print.summaryTitle")}:
      </div>

      <table
        className="w-full border-collapse border border-black text-[10.5pt] text-black"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #000000",
        }}
      >
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000000", padding: "5px 8px", width: "50%" }}>
              <span className="font-normal">{t("card:gradebook.print.gpa")} </span>
              <strong className="text-[11pt]">{summary.gpa.toFixed(2)} / 10</strong>
            </td>
            <td style={{ border: "1px solid #000000", padding: "5px 8px", width: "50%" }}>
              <span className="font-normal">{t("card:gradebook.print.academicRank")} </span>
              <strong className="text-[11pt]">{summary.academicRank}</strong>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000000", padding: "5px 8px" }}>
              <span className="font-normal">{t("card:gradebook.print.conductRank")} </span>
              <strong className="text-[11pt]">{summary.conductRank}</strong>
            </td>
            <td style={{ border: "1px solid #000000", padding: "5px 8px" }}>
              <span className="font-normal">{t("card:gradebook.print.classPosition")} </span>
              <strong className="text-[11pt]">
                {t("card:gradebook.summary.classRankText", {
                  rank: summary.classPosition,
                  total: summary.totalClassStudents,
                })}
              </strong>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000000", padding: "5px 8px" }} colSpan={2}>
              <span className="font-normal">{t("card:gradebook.print.titleAwarded")} </span>
              <strong className="uppercase text-[11pt]">{summary.titleAwarded}</strong>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000000", padding: "6px 8px" }} colSpan={2}>
              <div className="font-bold text-[11pt] mb-0.5">
                {t("card:gradebook.print.homeroomComment")}:
              </div>
              <div className="italic pl-2 leading-relaxed text-[10.5pt]">
                "{summary.homeroomComment || t("card:gradebook.print.defaultHomeroomComment")}"
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
