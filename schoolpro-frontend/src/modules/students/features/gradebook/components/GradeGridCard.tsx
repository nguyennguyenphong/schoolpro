import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectGradeItem } from "@/modules/students/features/gradebook/types";

interface GradeGridCardProps {
  item: SubjectGradeItem;
  onOpenDetail: (item: SubjectGradeItem) => void;
}

export const GradeGridCard: React.FC<GradeGridCardProps> = ({ item, onOpenDetail }) => {
  const { t } = useTranslation(["card"]);
  const isFeedback = item.evaluationType === "feedback";
  const score = item.averageScore || 0;

  const getScoreTheme = () => {
    if (isFeedback) {
      return {
        bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        badge: "bg-emerald-600 text-white",
        label:
          item.feedbackResult === "pass"
            ? t("card:gradebook.levels.pass")
            : t("card:gradebook.levels.fail"),
      };
    }
    if (score >= 8.0) {
      return {
        bg: "bg-blue-50 border-blue-200 text-blue-700",
        badge: "bg-blue-600 text-white",
        label: t("card:gradebook.levels.excellent"),
      };
    }
    if (score >= 6.5) {
      return {
        bg: "bg-amber-50 border-amber-200 text-amber-700",
        badge: "bg-amber-600 text-white",
        label: t("card:gradebook.levels.good"),
      };
    }
    return {
      bg: "bg-rose-50 border-rose-200 text-rose-700",
      badge: "bg-rose-600 text-white",
      label: t("card:gradebook.levels.average"),
    };
  };

  const theme = getScoreTheme();

  return (
    <Card
      onClick={() => onOpenDetail(item)}
      className="h-full rounded-xl shadow-2xs hover:border-blue-400 transition-all cursor-pointer group [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-4.5 [&>.ant-card-body]:h-full [&>.ant-card-body]:flex [&>.ant-card-body]:flex-col [&>.ant-card-body]:justify-between"
    >
      <div>
        {/* Row 1: Code tag, Periods, Grade level badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-[#f0f0f0]">
              {item.code}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {t("card:gradebook.detailModal.periodsPerWeek", {
                count: item.periodsPerWeek,
              })}
            </span>
          </div>

          <Tag color="geekblue" className="m-0 font-bold text-xs">
            {theme.label}
          </Tag>
        </div>

        {/* Row 2: Subject Title & Teacher */}
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
            {item.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Icon name="user" size={12} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">{item.teacher}</span>
          </div>
        </div>

        {/* Row 3: Prominent Score Display Box */}
        <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${theme.bg}`}>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {isFeedback
                ? t("card:gradebook.table.gradeLevel")
                : t("card:gradebook.table.averageScore")}
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              {isFeedback ? (
                <span className="text-lg font-extrabold text-emerald-700 flex items-center gap-1">
                  <Icon name="check" size={16} />
                  {item.feedbackResult === "pass"
                    ? t("card:gradebook.levels.pass")
                    : t("card:gradebook.levels.fail")}
                </span>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">
                    {score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/ 10.0</span>
                </>
              )}
            </div>
          </div>

          {!isFeedback && item.classAverage && (
            <div className="text-right text-xs">
              <div className="text-slate-400">{t("card:gradebook.detailModal.classAverageLabel")}</div>
              <strong className="text-slate-700 font-bold text-sm">
                {item.classAverage.toFixed(1)}
              </strong>
            </div>
          )}
        </div>

        {/* Row 4: Component Scores Breakdown Chips */}
        <div className="space-y-1.5 mb-3 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t("card:gradebook.detailModal.scoreStructureTitle")}:
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.regularScores.map((sc, i) => (
              <span
                key={sc.id}
                className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-[#f0f0f0]"
                title={`${sc.name}: ${sc.score}`}
              >
                TX{i + 1}: <strong>{sc.score}</strong>
              </span>
            ))}
            {item.midtermScore && (
              <span
                className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-200"
                title={`GK: ${item.midtermScore.score}`}
              >
                GK: <strong>{item.midtermScore.score}</strong>
              </span>
            )}
            {item.finalScore && (
              <span
                className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded text-[11px] font-bold border border-purple-200"
                title={`CK: ${item.finalScore.score}`}
              >
                CK: <strong>{item.finalScore.score}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Row 5: Teacher Comment */}
        <p
          className="text-xs text-slate-500 italic line-clamp-2 leading-relaxed mb-0 bg-slate-50/70 p-2.5 rounded-lg border border-[#f0f0f0]"
          title={item.teacherComment}
        >
          "{item.teacherComment}"
        </p>
      </div>

      {/* Row 6: Footer Action */}
      <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 font-medium">
          {item.academicYear} • {item.semester}
        </span>

        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(item);
          }}
          className="text-slate-700 group-hover:text-blue-600 group-hover:border-blue-300 font-semibold flex items-center gap-1.5"
        >
          <span>{t("card:gradebook.table.viewDetail")}</span>
          <Icon name="arrow-right" size={13} />
        </Button>
      </div>
    </Card>
  );
};
