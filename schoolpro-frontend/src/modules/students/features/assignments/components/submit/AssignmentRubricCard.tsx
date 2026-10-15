import React from "react";
import { message } from "@/components/ui/Message";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import type {
  AssignmentAttachment,
  AssignmentRubricCriterion,
} from "@/modules/students/features/assignments/types";

interface AssignmentRubricCardProps {
  rubric?: AssignmentRubricCriterion[];
  solutionAttachments?: AssignmentAttachment[];
  isGraded: boolean;
  onPreviewPdf: (file: { url: string; name: string; size: string }) => void;
  embedded?: boolean;
}

export const AssignmentRubricCard: React.FC<AssignmentRubricCardProps> = ({
  rubric,
  solutionAttachments,
  isGraded,
  onPreviewPdf,
  embedded = false,
}) => {
  const { t } = useTranslation(["card", "button"]);

  const hasRubric = Boolean(rubric && rubric.length > 0);
  const hasSolutions = Boolean(
    solutionAttachments && solutionAttachments.length > 0,
  );

  if (!hasRubric && !hasSolutions) return null;

  const content = (
    <div className="space-y-4">
      {hasRubric && rubric && (
        <div className="overflow-x-auto border border-[#f0f0f0] rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80">
                <th className="py-2.5 px-3 font-semibold">
                  {t("card:assignments.detail.rubricCriterion")}
                </th>
                <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap">
                  {t("card:assignments.detail.rubricMaxPoints")}
                </th>
                {isGraded && (
                  <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap">
                    {t("card:assignments.detail.rubricEarnedPoints")}
                  </th>
                )}
                {isGraded && (
                  <th className="py-2.5 px-3 font-semibold">
                    {t("card:assignments.detail.rubricTeacherComment")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rubric.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-2.5 px-3 align-top">
                    <span className="font-semibold text-slate-800 block">
                      {item.criterion}
                    </span>
                    {item.description && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-700 align-top whitespace-nowrap">
                    {item.maxPoints}
                  </td>
                  {isGraded && (
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 align-top whitespace-nowrap">
                      {item.earnedPoints ?? "-"} / {item.maxPoints}
                    </td>
                  )}
                  {isGraded && (
                    <td className="py-2.5 px-3 text-slate-600 italic align-top">
                      {item.comment || "-"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasSolutions && solutionAttachments && (
        <div className="p-4 border border-emerald-200 bg-emerald-50/30 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
            <h4 className="text-xs sm:text-sm font-bold text-emerald-950 mb-0">
              {t("card:assignments.detail.solutionFilesTitle")}
            </h4>
          </div>

          <div className="space-y-2">
            {solutionAttachments.map((file, idx) => {
              const isPdf =
                file.name.toLowerCase().endsWith(".pdf") ||
                (file.url ? file.url.toLowerCase().endsWith(".pdf") : false);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 bg-white border border-emerald-200 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Icon name="check" size={16} />
                    </div>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-semibold text-slate-800 truncate">
                        {file.name}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                        ({file.size})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPdf && (
                      <Button
                        variant="outline"
                        className="shrink-0 whitespace-nowrap text-xs h-7 px-2.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() =>
                          onPreviewPdf({
                            url: file.url || "/sample-notice.pdf",
                            name: file.name,
                            size: file.size,
                          })
                        }
                      >
                        <Icon name="eye" size={12} />
                        <span>{t("button:preview")}</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="shrink-0 whitespace-nowrap text-xs h-7 px-2.5"
                      onClick={() =>
                        message.info(`${t("button:download")}: ${file.name}`)
                      }
                    >
                      <Icon name="download" size={12} />
                      <span>{t("button:download")}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:assignments.detail.rubricTitle")}
          </h3>
        </div>
        {rubric && (
          <Tag color="processing" className="m-0 text-xs font-semibold">
            {rubric.length}
          </Tag>
        )}
      </div>
      {content}
    </div>
  );
};
