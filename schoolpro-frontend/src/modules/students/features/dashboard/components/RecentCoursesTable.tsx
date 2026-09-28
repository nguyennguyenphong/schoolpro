import React from "react";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { CourseResult } from "@/modules/students/features/dashboard/types";

interface RecentCoursesTableProps {
  courses: CourseResult[];
  semesterName?: string;
}

export const RecentCoursesTable: React.FC<RecentCoursesTableProps> = ({
  courses,
  semesterName = "Học kỳ gần nhất",
}) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "success";
      case "B+":
      case "B":
        return "processing";
      case "C+":
      case "C":
        return "warning";
      case "D":
        return "default";
      case "F":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-4 rounded-full bg-violet-600 inline-block" />
            <h3 className="text-base font-bold text-slate-900 mb-0">
              Chi tiết Điểm Học phần ({semesterName})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-0">
            Bảng điểm thành phần và kết quả đánh giá chi tiết từng môn học
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Tổng số: <strong>{courses.length}</strong> học phần
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Mã HP</th>
              <th className="py-2.5 px-3">Tên học phần</th>
              <th className="py-2.5 px-3 text-center">Số TC</th>
              <th className="py-2.5 px-3 text-center">Chuyên cần</th>
              <th className="py-2.5 px-3 text-center">Giữa kỳ</th>
              <th className="py-2.5 px-3 text-center">Cuối kỳ</th>
              <th className="py-2.5 px-3 text-center">Thang 10</th>
              <th className="py-2.5 px-3 text-center">Thang 4</th>
              <th className="py-2.5 px-3 text-center">Điểm chữ</th>
              <th className="py-2.5 px-3 text-center">Kết quả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="py-3 px-3 font-mono font-medium text-slate-600">
                  {course.courseCode}
                </td>
                <td className="py-3 px-3">
                  <span className="font-semibold text-slate-800 text-[13px] block">
                    {course.courseName}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-slate-600 font-medium">
                  {course.credits}
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-600">
                  {course.attendanceScore.toFixed(1)}
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-600">
                  {course.midtermScore.toFixed(1)}
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-600">
                  {course.finalScore.toFixed(1)}
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                  {course.totalScore10.toFixed(1)}
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-600">
                  {course.totalScore4.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-center">
                  <Tag
                    color={getGradeColor(course.letterGrade)}
                    className="font-bold font-mono px-2 py-0.5 text-xs m-0"
                  >
                    {course.letterGrade}
                  </Tag>
                </td>
                <td className="py-3 px-3 text-center">
                  {course.status === "passed" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Đạt
                    </span>
                  ) : course.status === "failed" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      ✕ Học lại
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Đang học
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
