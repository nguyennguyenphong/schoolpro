import React from "react";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AttendanceDetail, StudentAcademicOverview } from "@/modules/students/features/dashboard/types";

interface AttendanceConductCardProps {
  attendance: AttendanceDetail;
  overview: StudentAcademicOverview;
}

export const AttendanceConductCard: React.FC<AttendanceConductCardProps> = ({
  attendance,
  overview,
}) => {
  const chartData = [
    { value: attendance.attended, name: "Có mặt", itemStyle: { color: "#10b981" } },
    { value: attendance.excused, name: "Nghỉ phép", itemStyle: { color: "#3b82f6" } },
    { value: attendance.late, name: "Đi muộn", itemStyle: { color: "#f59e0b" } },
    ...(attendance.unexcused > 0
      ? [{ value: attendance.unexcused, name: "K.Phép", itemStyle: { color: "#ef4444" } }]
      : []),
  ];

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
      formatter: "{b}: <strong>{c} buổi</strong> ({d}%)",
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: "#64748b",
        fontSize: 11,
      },
    },
    series: [
      {
        name: "Điểm danh",
        type: "pie",
        radius: ["52%", "74%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "center",
          formatter: () => `${overview.attendanceRate}%\nChuyên cần`,
          fontSize: 12,
          fontWeight: "bold",
          color: "#0f172a",
          lineHeight: 16,
        },
        data: chartData,
      },
    ],
  };

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs h-full flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
              Chuyên Cần & Nề Nếp
            </h3>
          </div>
          <Tag color="success" className="m-0 text-xs font-semibold">
            Hạnh kiểm: {overview.conductRank}
          </Tag>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Biểu đồ tỷ lệ chuyên cần và nhận xét tu dưỡng từ Giáo viên chủ nhiệm
        </p>

        {/* ECharts Attendance Donut Chart with explicit height 160 */}
        <div className="w-full">
          <Chart option={option} height={160} className="w-full" />
        </div>

        {/* Homeroom teacher comment callout */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs mt-3">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
            <Icon name="edit" size={13} className="text-blue-600 shrink-0" />
            <span>Lời phê của Giáo viên chủ nhiệm:</span>
          </div>
          <p className="text-slate-700 italic mb-0 leading-relaxed">
            "{attendance.homeroomEvaluation}"
          </p>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Điểm rèn luyện: <strong className="text-slate-800">{attendance.disciplineScore}/100</strong></span>
        <span>Xếp loại: <strong className="text-emerald-600">Gương mẫu</strong></span>
      </div>
    </div>
  );
};

export const GradeDistributionChart = AttendanceConductCard;
