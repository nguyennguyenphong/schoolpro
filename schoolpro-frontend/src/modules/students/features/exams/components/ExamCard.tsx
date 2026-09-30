import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ExamItem } from "@/modules/students/features/exams/types";

interface ExamCardProps {
  item: ExamItem;
  onOpen: (item: ExamItem) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ item, onOpen }) => {
  const isPending = item.status === "pending";
  const isCompleted = item.status === "completed";
  const isExpired = item.status === "expired";

  return (
    <Card className="rounded-xl shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5 flex flex-col justify-between h-full group">
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag color="blue" className="m-0 font-semibold text-xs">
              {item.courseCode}
            </Tag>

            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
              {item.code}
            </span>

            <Tag color="purple" className="m-0 font-semibold text-xs">
              Trắc nghiệm
            </Tag>
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

        {/* Exam Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-2">
          {item.title}
        </h3>

        {/* Target Subject / Teacher */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2 bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-blue-100/80">
          <Icon name="book" size={13} className="text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-800">{item.courseName}</span>
          {item.teacherName && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{item.teacherName}</span>
            </>
          )}
        </div>

        {/* Description / Info */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          Đề thi trắc nghiệm trực tuyến tính giờ gồm {item.totalQuestions} câu hỏi theo thang điểm {item.maxScore}.
        </p>

        {/* Meta Stats Row */}
        <div className="mt-2 flex items-center gap-3.5 text-xs text-slate-400 flex-wrap pt-1">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={13} className="text-slate-400" />
            <span>~{item.durationMinutes} phút làm</span>
          </span>
          <span className="flex items-center gap-1">
            <Icon name="fileText" size={13} className="text-slate-400" />
            <span>{item.totalQuestions} câu hỏi</span>
          </span>
          <span className="flex items-center gap-1">
            <Icon name="calendar" size={13} className="text-slate-400" />
            <span>Hạn chót: <strong className="text-slate-700">{item.endDate}</strong></span>
          </span>
          <span className="flex items-center gap-1">
            {isCompleted && item.completedAt ? (
              <span className="flex items-center gap-1.5">
                <span>Đã nộp: <strong>{item.completedAt}</strong></span>
                {item.score !== undefined && (
                  <Tag color="success" className="m-0 font-bold">
                    {item.score} / {item.maxScore} đ
                  </Tag>
                )}
              </span>
            ) : (
              <span>Học kỳ 1 • 2025-2026</span>
            )}
          </span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 mt-3 flex items-center justify-end gap-2">
        <div>
          {isPending && (
            <Button
              variant="primary"
              onClick={() => onOpen(item)}
              className="font-semibold flex items-center gap-1.5"
            >
              <Icon name="edit" size={14} />
              <span>Vào làm bài thi</span>
            </Button>
          )}

          {isCompleted && (
            <Button
              variant="outline"
              onClick={() => onOpen(item)}
              className="text-slate-700 font-semibold flex items-center gap-1.5"
            >
              <Icon name="eye" size={14} />
              <span>Xem lại bài làm</span>
            </Button>
          )}

          {isExpired && (
            <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 bg-slate-100 rounded-lg">
              Đã đóng đề thi
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
