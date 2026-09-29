import React from "react";
import { Tag } from "@/components/ui/Tag";
import type { SubjectGradeDetail } from "@/modules/students/features/dashboard/types";

interface SubjectGradesTableProps {
  grades: SubjectGradeDetail[];
  semesterName?: string;
}

export const SubjectGradesTable: React.FC<SubjectGradesTableProps> = ({
  grades,
  semesterName = "Học kỳ 1 (2025-2026)",
}) => {
  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Tốt":
      case "Giỏi":
        return "success";
      case "Khá":
        return "processing";
      case "Đạt":
        return "warning";
      case "Chưa đạt":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div className="p-4 sm:p-5 border border-slate-200 bg-white rounded-xl shadow-2xs">
      {/* Header of Table Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-base font-bold text-slate-900 mb-0">
              Bảng điểm chi tiết các môn học ({semesterName})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-0">
            Sổ đánh giá học tập theo Thông tư 22/TT-BGDĐT: Đánh giá thường xuyên (ĐGTX), giữa kỳ (ĐGGK), cuối kỳ (ĐGCK) và ĐTB môn
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            Tổng số: <strong className="text-slate-800 font-bold">{grades.length}</strong> môn học
          </span>
        </div>
      </div>

      {/* Responsive Horizontal Scroll Wrapper */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[1180px] text-left border-collapse text-xs">
          {/* Multi-tier Structured Table Header */}
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider text-center">
              <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-200 w-12 whitespace-nowrap">
                STT
              </th>
              <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[150px] whitespace-nowrap">
                Môn học
              </th>
              <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[140px] whitespace-nowrap">
                Giáo viên bộ môn
              </th>
              <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-200 w-16 whitespace-nowrap">
                Tiết/Tuần
              </th>

              {/* Nhóm Đánh giá thường xuyên (colSpan 4) */}
              <th colSpan={4} className="py-2 px-2 border-r border-slate-200 bg-blue-50/60 text-blue-900 whitespace-nowrap font-bold">
                Đánh giá thường xuyên (ĐGTX)
              </th>

              {/* Nhóm Đánh giá định kỳ (colSpan 2) */}
              <th colSpan={2} className="py-2 px-2 border-r border-slate-200 bg-amber-50/60 text-amber-900 whitespace-nowrap font-bold">
                Đánh giá định kỳ
              </th>

              {/* Nhóm Điểm trung bình môn (colSpan 2) */}
              <th colSpan={2} className="py-2 px-2 border-r border-slate-200 bg-emerald-50/60 text-emerald-900 whitespace-nowrap font-bold">
                Điểm TB Môn
              </th>

              <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-200 w-24 whitespace-nowrap">
                Đánh giá
              </th>
              <th rowSpan={2} className="py-2.5 px-3 text-left min-w-[280px] whitespace-nowrap">
                Nhận xét & Lời phê của giáo viên
              </th>
            </tr>

            {/* Sub-header Row for Columns */}
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase text-center tracking-wider">
              {/* ĐGTX 1..4 */}
              <th className="py-2 px-2 border-r border-slate-200 w-14 whitespace-nowrap bg-blue-50/30">
                TX 1
              </th>
              <th className="py-2 px-2 border-r border-slate-200 w-14 whitespace-nowrap bg-blue-50/30">
                TX 2
              </th>
              <th className="py-2 px-2 border-r border-slate-200 w-14 whitespace-nowrap bg-blue-50/30">
                TX 3
              </th>
              <th className="py-2 px-2 border-r border-slate-200 w-14 whitespace-nowrap bg-blue-50/30">
                TX 4
              </th>

              {/* ĐGĐK Giữa kỳ & Cuối kỳ */}
              <th className="py-2 px-2 border-r border-slate-200 w-20 whitespace-nowrap bg-amber-50/30 text-amber-800">
                Giữa kỳ (x2)
              </th>
              <th className="py-2 px-2 border-r border-slate-200 w-20 whitespace-nowrap bg-amber-50/30 text-amber-800">
                Cuối kỳ (x3)
              </th>

              {/* ĐTB HK1 & Cả năm */}
              <th className="py-2 px-2 border-r border-slate-200 w-20 whitespace-nowrap bg-emerald-50/30 text-emerald-800">
                ĐTB HK1
              </th>
              <th className="py-2 px-2 border-r border-slate-200 w-20 whitespace-nowrap bg-emerald-50/30 text-emerald-800">
                Cả năm
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {grades.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                {/* 1. STT */}
                <td className="py-2.5 px-2.5 text-center font-bold text-slate-400 border-r border-slate-100 whitespace-nowrap">
                  {item.stt}
                </td>

                {/* 2. Subject Name */}
                <td className="py-2.5 px-3 border-r border-slate-100 whitespace-nowrap">
                  <div className="font-bold text-slate-900 text-xs">
                    {item.subjectName}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {item.subjectCode}
                  </span>
                </td>

                {/* 3. Teacher Name */}
                <td className="py-2.5 px-3 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                  {item.teacherName}
                </td>

                {/* 4. Periods Per Week */}
                <td className="py-2.5 px-2 text-center text-slate-500 font-medium border-r border-slate-100 whitespace-nowrap">
                  {item.periodsPerWeek} tiết
                </td>

                {/* 5. TX1 */}
                <td className="py-2.5 px-2 text-center font-semibold text-slate-700 border-r border-slate-100 whitespace-nowrap">
                  {item.regularScores[0] !== undefined ? item.regularScores[0].toFixed(1) : "—"}
                </td>

                {/* 6. TX2 */}
                <td className="py-2.5 px-2 text-center font-semibold text-slate-700 border-r border-slate-100 whitespace-nowrap">
                  {item.regularScores[1] !== undefined ? item.regularScores[1].toFixed(1) : "—"}
                </td>

                {/* 7. TX3 */}
                <td className="py-2.5 px-2 text-center font-semibold text-slate-700 border-r border-slate-100 whitespace-nowrap">
                  {item.regularScores[2] !== undefined ? item.regularScores[2].toFixed(1) : "—"}
                </td>

                {/* 8. TX4 */}
                <td className="py-2.5 px-2 text-center font-semibold text-slate-700 border-r border-slate-100 whitespace-nowrap">
                  {item.regularScores[3] !== undefined ? item.regularScores[3].toFixed(1) : "—"}
                </td>

                {/* 9. Midterm Score (ĐGGK) */}
                <td className="py-2.5 px-2 text-center font-bold text-amber-700 bg-amber-50/20 border-r border-slate-100 whitespace-nowrap">
                  {item.midtermScore.toFixed(1)}
                </td>

                {/* 10. Final Score (ĐGCK) */}
                <td className="py-2.5 px-2 text-center font-bold text-amber-700 bg-amber-50/20 border-r border-slate-100 whitespace-nowrap">
                  {item.finalScore.toFixed(1)}
                </td>

                {/* 11. Average Score (ĐTB HK1) */}
                <td className="py-2.5 px-2 text-center border-r border-slate-100 whitespace-nowrap bg-emerald-50/20">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md font-extrabold text-xs ${
                      item.averageScore >= 8.0
                        ? "bg-emerald-100/70 text-emerald-800 border border-emerald-300"
                        : item.averageScore >= 6.5
                          ? "bg-blue-100/70 text-blue-800 border border-blue-300"
                          : "bg-amber-100/70 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {item.averageScore.toFixed(2)}
                  </span>
                </td>

                {/* 12. Annual Average Score (ĐTB Cả năm) */}
                <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-100 whitespace-nowrap bg-emerald-50/10">
                  {item.annualAverageScore ? item.annualAverageScore.toFixed(2) : "—"}
                </td>

                {/* 13. Rank */}
                <td className="py-2.5 px-2.5 text-center border-r border-slate-100 whitespace-nowrap">
                  <Tag color={getRankColor(item.rank)} className="m-0 font-semibold px-2 py-0.5">
                    {item.rank}
                  </Tag>
                </td>

                {/* 14. Teacher Feedback */}
                <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-relaxed italic">
                  {item.feedback || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note under table */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-[11px] text-slate-400">
        <span>* Công thức tính: ĐTBm HK = (Tổng điểm ĐGTX + 2 × ĐGGK + 3 × ĐGCK) / (Số điểm ĐGTX + 5)</span>
        <span>Quy chế đánh giá xếp loại theo Thông tư 22/2021/TT-BGDĐT</span>
      </div>
    </div>
  );
};

export const RecentCoursesTable = SubjectGradesTable;
