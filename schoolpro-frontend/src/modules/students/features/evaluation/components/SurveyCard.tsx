import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SurveyItem } from "@/modules/students/features/evaluation/types";

interface SurveyCardProps {
  item: SurveyItem;
  onTakeSurvey: (item: SurveyItem) => void;
  onViewResponse: (item: SurveyItem) => void;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({
  item,
  onTakeSurvey,
  onViewResponse,
}) => {
  const getCategoryColor = (cat: SurveyItem["category"]) => {
    switch (cat) {
      case "teaching_quality":
        return "blue";
      case "conduct_self":
        return "purple";
      case "facilities":
        return "orange";
      case "school_activities":
        return "green";
      default:
        return "default";
    }
  };

  const isPending = item.status === "pending";
  const isCompleted = item.status === "completed";
  const isExpired = item.status === "expired";

  return (
    <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5 flex flex-col justify-between h-full group">
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag color={getCategoryColor(item.category)} className="m-0 font-semibold text-xs">
              {item.categoryName}
            </Tag>

            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
              {item.code}
            </span>

            {item.isAnonymous ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Icon name="lock" size={12} />
                <span>Ẩn danh 100%</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Icon name="user" size={12} />
                <span>Định danh cá nhân</span>
              </span>
            )}
          </div>

          <div>
            {isPending && (
              <Tag color="warning" className="m-0 font-semibold text-xs">
                Chờ thực hiện
              </Tag>
            )}
            {isCompleted && (
              <Tag color="success" className="m-0 font-semibold text-xs">
                Đã hoàn thành
              </Tag>
            )}
            {isExpired && (
              <Tag color="default" className="m-0 font-semibold text-xs">
                Đã kết thúc
              </Tag>
            )}
          </div>
        </div>

        {/* Survey Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-2">
          {item.title}
        </h3>

        {/* Target Subject / Teacher if present */}
        {item.targetSubject && (
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-2 bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-blue-100/80">
            <Icon name="book" size={13} className="text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-800">{item.targetSubject}</span>
            {item.targetTeacher && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">{item.targetTeacher}</span>
              </>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {item.description}
        </p>

        {/* Meta Stats Row */}
        <div className="flex items-center gap-3.5 text-xs text-slate-400 flex-wrap pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={13} className="text-slate-400" />
            <span>~{item.estimatedMinutes} phút làm</span>
          </span>
          <span className="flex items-center gap-1">
            <Icon name="fileText" size={13} className="text-slate-400" />
            <span>{item.totalQuestions} câu hỏi</span>
          </span>
          <span className="flex items-center gap-1">
            <Icon name="calendar" size={13} className="text-slate-400" />
            <span>Hạn chót: <strong className="text-slate-700">{item.endDate}</strong></span>
          </span>
        </div>
      </div>

      {/* Footer Action (No className mr on Icon) */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-400">
          {isCompleted && item.completedAt ? (
            <span>Đã gửi lúc: <strong>{item.completedAt}</strong></span>
          ) : (
            <span>Học kỳ 1 • 2025-2026</span>
          )}
        </div>

        <div>
          {isPending && (
            <Button
              variant="primary"
              onClick={() => onTakeSurvey(item)}
              className="font-semibold flex items-center gap-1.5"
            >
              <Icon name="edit" size={14} />
              <span>Thực hiện đánh giá</span>
            </Button>
          )}

          {isCompleted && (
            <Button
              variant="outline"
              onClick={() => onViewResponse(item)}
              className="text-slate-700 font-semibold flex items-center gap-1.5"
            >
              <Icon name="eye" size={14} />
              <span>Xem lại phản hồi</span>
            </Button>
          )}

          {isExpired && (
            <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 bg-slate-100 rounded-lg">
              Đã đóng biểu mẫu
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
