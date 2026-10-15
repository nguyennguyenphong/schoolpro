import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectGradeItem } from "@/modules/students/features/gradebook/types";

interface SubjectGradeDetailModalProps {
  isOpen: boolean;
  item: SubjectGradeItem | null;
  onClose: () => void;
}

export const SubjectGradeDetailModal: React.FC<SubjectGradeDetailModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  const { t } = useTranslation(["card"]);

  if (!item) return null;

  const isFeedback = item.evaluationType === "feedback";
  const allTests = [
    ...item.regularScores.map((s) => ({
      ...s,
      category: t("card:gradebook.detailModal.regularScoresTitle"),
    })),
    ...(item.midtermScore
      ? [
          {
            ...item.midtermScore,
            category: t("card:gradebook.detailModal.midtermScoreTitle"),
          },
        ]
      : []),
    ...(item.finalScore
      ? [
          {
            ...item.finalScore,
            category: t("card:gradebook.detailModal.finalScoreTitle"),
          },
        ]
      : []),
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            {t("card:gradebook.transcriptModal.close")}
          </Button>
        </div>
      }
      width={680}
      title={null}
      destroyOnHidden
      centered
    >
      <div className="space-y-4 pt-1">
        {/* Header */}
        <div className="border-b border-[#f0f0f0] pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-0">
              {t("card:gradebook.detailModal.title")} - {item.name}
            </h2>
            <Tag color="blue" className="font-bold m-0">
              {item.code}
            </Tag>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Icon name="user" size={12} className="text-blue-600" />
              {item.teacher} ({item.teacherTitle})
            </span>
            <span>•</span>
            <span>
              {t("card:gradebook.detailModal.periodsPerWeek", {
                count: item.periodsPerWeek,
              })}
            </span>
            <span>•</span>
            <span>
              {item.academicYear} • {item.semester}
            </span>
          </div>
        </div>

        {/* Metric Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
            <div className="text-[11px] font-semibold text-blue-700 uppercase">
              {isFeedback
                ? t("card:gradebook.table.gradeLevel")
                : t("card:gradebook.detailModal.averageScoreTitle")}
            </div>
            <div className="text-xl font-black text-blue-900 mt-0.5">
              {isFeedback
                ? item.feedbackResult === "pass"
                  ? t("card:gradebook.levels.pass")
                  : t("card:gradebook.levels.fail")
                : `${item.averageScore?.toFixed(1)}/10`}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-[#f0f0f0]">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              {t("card:gradebook.table.gradeLevel")}
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {isFeedback
                ? item.feedbackResult === "pass"
                  ? t("card:gradebook.levels.pass")
                  : t("card:gradebook.levels.fail")
                : item.averageScore && item.averageScore >= 8.0
                ? t("card:gradebook.levels.excellent")
                : t("card:gradebook.levels.good")}
            </div>
          </div>

          {!isFeedback && (
            <>
              <div className="bg-slate-50 p-3 rounded-xl border border-[#f0f0f0]">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">
                  {t("card:gradebook.detailModal.classAverageLabel")}
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {item.classAverage?.toFixed(1) || "--"} / 10
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-[#f0f0f0]">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">
                  {t("card:gradebook.detailModal.highestScoreLabel")}
                </div>
                <div className="text-sm font-bold text-emerald-600 mt-1">
                  {item.highestScore?.toFixed(1) || "--"} / 10
                </div>
              </div>
            </>
          )}
        </div>

        {/* Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            {t("card:gradebook.detailModal.scoreStructureTitle")}
          </h4>

          <div className="border border-[#f0f0f0] rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#f0f0f0] text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">{t("card:gradebook.table.subject")}</th>
                  <th className="py-2.5 px-3">
                    {t("card:gradebook.detailModal.evaluationMethod")}
                  </th>
                  <th className="py-2.5 px-3">Ngày</th>
                  <th className="py-2.5 px-3 text-right">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allTests.map((tItem) => (
                  <tr key={tItem.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {tItem.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {tItem.category}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {tItem.date}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-extrabold text-blue-600 text-sm">
                        {tItem.score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Comment Box */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-[#f0f0f0] space-y-1">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Icon name="fileText" size={13} className="text-blue-600" />
            <span>{t("card:gradebook.detailModal.teacherCommentTitle")}</span>
          </div>
          <p className="text-xs text-slate-600 italic leading-relaxed mb-0">
            "{item.teacherComment}"
          </p>
        </div>
      </div>
    </Modal>
  );
};
