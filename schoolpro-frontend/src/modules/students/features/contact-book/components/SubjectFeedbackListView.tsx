import React, { useState } from "react";
import { Empty, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectFeedbackItem } from "@/modules/students/features/contact-book/types";

interface SubjectFeedbackListViewProps {
  feedbacks: SubjectFeedbackItem[];
  searchQuery: string;
  onResetFilters: () => void;
}

export const SubjectFeedbackListView: React.FC<SubjectFeedbackListViewProps> = ({
  feedbacks,
  searchQuery,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const getStatusBadge = (status: SubjectFeedbackItem["status"]) => {
    switch (status) {
      case "excellent":
        return <Tag color="success" className="font-semibold text-[11px] m-0">Xuất sắc</Tag>;
      case "good":
        return <Tag color="processing" className="font-semibold text-[11px] m-0">Học lực Giỏi</Tag>;
      case "improving":
        return <Tag color="warning" className="font-semibold text-[11px] m-0">Đang tiến bộ</Tag>;
      case "needs_attention":
        return <Tag color="error" className="font-semibold text-[11px] m-0">Cần cố gắng</Tag>;
      default:
        return null;
    }
  };

  const columns: ColumnsType<SubjectFeedbackItem> = [
    {
      title: "Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
      width: 180,
      render: (name: string, record) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs sm:text-sm">{name}</span>
          <span className="text-[11px] text-slate-500 font-medium">{record.teacherName}</span>
        </div>
      ),
    },
    {
      title: "Điểm thường xuyên",
      dataIndex: "regularScores",
      key: "regularScores",
      width: 160,
      render: (scores: number[]) => (
        <div className="flex flex-wrap gap-1.5">
          {scores.map((s, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Điểm giữa kỳ",
      dataIndex: "midtermScore",
      key: "midtermScore",
      width: 120,
      align: "center",
      render: (score: number | null) => (
        <span className="font-bold font-mono text-xs sm:text-sm text-blue-600">
          {score !== null ? score.toFixed(1) : "—"}
        </span>
      ),
    },
    {
      title: "ĐTB môn",
      dataIndex: "averageScore",
      key: "averageScore",
      width: 110,
      align: "center",
      render: (score: number | null) => (
        <span className="font-extrabold font-mono text-xs sm:text-sm text-emerald-600">
          {score !== null ? score.toFixed(1) : "—"}
        </span>
      ),
    },
    {
      title: "Nhận xét của Giáo viên bộ môn",
      dataIndex: "teacherComment",
      key: "teacherComment",
      render: (comment: string, record) => (
        <div className="space-y-1">
          <p className="text-xs text-slate-700 leading-relaxed mb-0">{comment}</p>
          <div>{getStatusBadge(record.status)}</div>
        </div>
      ),
    },
  ];

  if (feedbacks.length === 0) {
    return (
      <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
        <Empty
          description={
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-slate-700 mb-0">
                Không tìm thấy môn học phù hợp
              </p>
              <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                Không có môn học hoặc nhận xét nào khớp với từ khóa "{searchQuery}".
              </p>
            </div>
          }
        >
          <Button variant="outline" onClick={onResetFilters} className="mt-3">
            Đặt lại tìm kiếm
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* View switch mode bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-xs text-slate-500">
          Hiển thị <strong>{feedbacks.length}</strong> bộ môn được giáo viên gửi nhận xét
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="bookmark" size={13} />
            <span>Dạng thẻ</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon name="fileText" size={13} />
            <span>Dạng bảng</span>
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table
            columns={columns}
            dataSource={feedbacks}
            rowKey="id"
            pagination={false}
            className="[&_.ant-table-thead_th]:bg-slate-50 [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:text-slate-700"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((item) => (
            <Card
              key={item.id}
              className="rounded-xl border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-blue-300 transition-all [&>.ant-card-body]:p-5"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 mb-0">
                        {item.subjectName}
                      </h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      Giáo viên: <strong className="text-slate-700">{item.teacherName}</strong>
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">ĐTB Môn</span>
                    <span className="text-xl font-extrabold text-blue-600 font-mono">
                      {item.averageScore !== null ? item.averageScore.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>

                {/* Scores pill row */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs mb-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Kiểm tra thường xuyên:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.regularScores.map((score, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800"
                        >
                          {score}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block mb-1">Giữa kỳ:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-700">
                      {item.midtermScore !== null ? item.midtermScore.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>

                {/* Teacher comment */}
                <div className="space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Lời nhận xét & đánh giá:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-0 bg-blue-50/30 p-3 rounded-lg border border-blue-100/60">
                    "{item.teacherComment}"
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Mã học phần: {item.subjectCode}</span>
                <span className="text-blue-600 font-medium">Học kỳ 1</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
