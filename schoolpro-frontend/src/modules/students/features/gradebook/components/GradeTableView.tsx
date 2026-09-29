import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectGradeItem, GradeSummary } from "@/modules/students/features/gradebook/types";

interface GradeTableViewProps {
  grades: SubjectGradeItem[];
  summary: GradeSummary | null;
  onOpenDetail: (item: SubjectGradeItem) => void;
}

export const GradeTableView: React.FC<GradeTableViewProps> = ({
  grades,
  summary,
  onOpenDetail,
}) => {
  const getAverageScoreBadge = (score?: number, isFeedback?: boolean, feedbackResult?: string) => {
    if (isFeedback) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Icon name="check" size={12} className="mr-1" />
          {feedbackResult === "pass" ? "ĐẠT (Tốt)" : "CHƯA ĐẠT"}
        </span>
      );
    }

    if (score === undefined) return <span className="text-slate-400">--</span>;

    let badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
    if (score >= 9.0) {
      badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
    } else if (score >= 8.0) {
      badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
    } else if (score >= 6.5) {
      badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
    } else {
      badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
    }

    return (
      <span
        className={`inline-flex items-center justify-center font-extrabold text-sm px-2.5 py-0.5 rounded-lg border shadow-2xs ${badgeColor}`}
      >
        {score.toFixed(1)}
      </span>
    );
  };

  const getGradeLevelTag = (item: SubjectGradeItem) => {
    if (item.evaluationType === "feedback") {
      return (
        <Tag color="green" className="m-0 font-semibold">
          Hoàn thành tốt
        </Tag>
      );
    }

    const score = item.averageScore || 0;
    if (score >= 9.0) {
      return (
        <Tag color="geekblue" className="m-0 font-semibold">
          Xuất sắc
        </Tag>
      );
    }
    if (score >= 8.0) {
      return (
        <Tag color="blue" className="m-0 font-semibold">
          Giỏi
        </Tag>
      );
    }
    if (score >= 6.5) {
      return (
        <Tag color="orange" className="m-0 font-semibold">
          Khá
        </Tag>
      );
    }
    return (
      <Tag color="red" className="m-0 font-semibold">
        Đạt
      </Tag>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4 w-12 text-center">STT</th>
              <th className="py-3.5 px-4 min-w-[200px]">Môn học & Giáo viên</th>
              <th className="py-3.5 px-3 min-w-[170px] text-center">
                ĐĐG Thường xuyên (x1)
              </th>
              <th className="py-3.5 px-3 w-28 text-center">
                Giữa kỳ (x2)
              </th>
              <th className="py-3.5 px-3 w-28 text-center">
                Cuối kỳ (x3)
              </th>
              <th className="py-3.5 px-3 w-28 text-center">
                ĐTB Môn
              </th>
              <th className="py-3.5 px-3 w-28 text-center">
                Xếp loại
              </th>
              <th className="py-3.5 px-4 min-w-[240px]">
                Nhận xét của Giáo viên
              </th>
              <th className="py-3.5 px-3 w-24 text-center">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {grades.map((item, idx) => (
              <tr
                key={item.id}
                onClick={() => onOpenDetail(item)}
                className="hover:bg-blue-50/25 transition-colors cursor-pointer group"
              >
                {/* 1. STT */}
                <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                  {idx + 1}
                </td>

                {/* 2. Môn học & Giáo viên */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
                        {item.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Icon name="user" size={11} className="text-slate-400" />
                      <span>{item.teacher}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">{item.periodsPerWeek} tiết/tuần</span>
                    </div>
                  </div>
                </td>

                {/* 3. Đánh giá thường xuyên */}
                <td className="py-3.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {item.regularScores.map((scoreItem) => (
                      <span
                        key={scoreItem.id}
                        className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200"
                        title={`${scoreItem.name}: ${scoreItem.score} điểm (${scoreItem.date})`}
                      >
                        {scoreItem.score.toFixed(1)}
                      </span>
                    ))}
                  </div>
                </td>

                {/* 4. Giữa kỳ (x2) */}
                <td className="py-3.5 px-3 text-center">
                  {item.midtermScore ? (
                    <span
                      className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200"
                      title={`${item.midtermScore.name}: ${item.midtermScore.score} điểm`}
                    >
                      {item.midtermScore.score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-slate-300">--</span>
                  )}
                </td>

                {/* 5. Cuối kỳ (x3) */}
                <td className="py-3.5 px-3 text-center">
                  {item.finalScore ? (
                    <span
                      className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold text-xs border border-purple-200"
                      title={`${item.finalScore.name}: ${item.finalScore.score} điểm`}
                    >
                      {item.finalScore.score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-slate-300">--</span>
                  )}
                </td>

                {/* 6. Điểm trung bình môn */}
                <td className="py-3.5 px-3 text-center">
                  {getAverageScoreBadge(
                    item.averageScore,
                    item.evaluationType === "feedback",
                    item.feedbackResult,
                  )}
                </td>

                {/* 7. Xếp loại */}
                <td className="py-3.5 px-3 text-center">
                  {getGradeLevelTag(item)}
                </td>

                {/* 8. Lời nhận xét */}
                <td className="py-3.5 px-4 text-xs text-slate-600">
                  <p
                    className="line-clamp-2 mb-0 italic text-slate-600"
                    title={item.teacherComment}
                  >
                    "{item.teacherComment}"
                  </p>
                </td>

                {/* 9. Thao tác */}
                <td className="py-3.5 px-3 text-center">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(item);
                    }}
                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    Chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Hàng tổng kết toàn bảng */}
          {summary && (
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs sm:text-sm">
                <td colSpan={2} className="py-4 px-4 text-slate-800">
                  <span className="text-base text-blue-700">TỔNG KẾT HỌC KỲ 1:</span>
                  <div className="text-xs font-normal text-slate-500 mt-0.5">
                    Học bạ điện tử mã xác thực: <strong>SCH-2025-11A1-88</strong>
                  </div>
                </td>
                <td colSpan={3} className="py-4 px-3 text-center text-xs text-slate-600">
                  <span>11 môn tính điểm số</span>
                  <span className="mx-2">•</span>
                  <span>2 môn đánh giá Đạt</span>
                </td>
                <td className="py-4 px-3 text-center">
                  <span className="inline-flex items-center justify-center font-black text-base px-3 py-1 rounded-xl bg-blue-600 text-white shadow-xs">
                    {summary.gpa.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-3 text-center">
                  <Tag color="geekblue" className="text-xs font-bold m-0 px-2 py-0.5">
                    {summary.academicRank}
                  </Tag>
                </td>
                <td colSpan={2} className="py-4 px-4 text-xs text-slate-600">
                  <div>
                    Hạnh kiểm: <strong className="text-emerald-700">{summary.conductRank}</strong>
                    <span className="mx-1.5">•</span>
                    Thứ hạng: <strong className="text-amber-700">Hạng {summary.classPosition}/{summary.totalClassStudents}</strong>
                  </div>
                  <div className="text-slate-500 font-normal truncate mt-0.5">
                    GVCN: {summary.homeroomTeacher}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
