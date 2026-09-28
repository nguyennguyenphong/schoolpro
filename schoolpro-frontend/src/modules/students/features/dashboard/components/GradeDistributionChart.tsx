import React from "react";
import { Card } from "@/components/ui/Card";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { GradeDistribution } from "@/modules/students/features/dashboard/types";

interface GradeDistributionChartProps {
  data: GradeDistribution[];
}

export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({ data }) => {
  const grades = data.map((d) => d.grade);
  const counts = data.map((d) => d.count);
  const colors = data.map((d) => d.color);

  const totalCourses = data.reduce((acc, cur) => acc + cur.count, 0);

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
      formatter: (params: unknown) => {
        const p = Array.isArray(params) ? params[0] : params;
        const item = data.find((d) => d.grade === p.name);
        return `
          <div style="font-weight: 600; margin-bottom: 2px;">Điểm chữ: ${p.name}</div>
          <div>Số học phần: <strong>${p.value}</strong> môn</div>
          <div style="color: #94a3b8; font-size: 11px;">Tỷ lệ: ${item?.percentage || 0}%</div>
        `;
      },
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: grades,
      axisLine: {
        lineStyle: {
          color: "#cbd5e1",
        },
      },
      axisLabel: {
        color: "#475569",
        fontSize: 12,
        fontWeight: "bold",
      },
    },
    yAxis: {
      type: "value",
      name: "Số môn",
      minInterval: 1,
      nameTextStyle: {
        color: "#94a3b8",
        fontSize: 11,
      },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: "#f1f5f9",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "Số học phần",
        type: "bar",
        barWidth: "40%",
        data: counts.map((count, idx) => ({
          value: count,
          itemStyle: {
            color: colors[idx],
            borderRadius: [4, 4, 0, 0],
          },
        })),
        label: {
          show: true,
          position: "top",
          color: "#475569",
          fontSize: 11,
          fontWeight: 600,
          formatter: "{c}",
        },
      },
    ],
  };

  return (
    <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
            <h3 className="text-base font-bold text-slate-900 mb-0">
              Phổ Điểm Học phần (Thang chữ)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Tổng cộng: <strong className="text-slate-800">{totalCourses} môn</strong>
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Thống kê kết quả phân loại điểm của toàn bộ học phần đã hoàn thành
        </p>
      </div>

      <Chart option={option} height={260} />

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 px-1">
        <div className="text-center">
          <span className="text-[11px] text-slate-400 block">Tỷ lệ A/A+</span>
          <span className="text-sm font-bold text-emerald-600">
            {((data.filter((d) => d.grade.startsWith("A")).reduce((s, d) => s + d.count, 0) / (totalCourses || 1)) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-[1px] h-6 bg-slate-200" />
        <div className="text-center">
          <span className="text-[11px] text-slate-400 block">Tỷ lệ B/B+</span>
          <span className="text-sm font-bold text-blue-600">
            {((data.filter((d) => d.grade.startsWith("B")).reduce((s, d) => s + d.count, 0) / (totalCourses || 1)) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-[1px] h-6 bg-slate-200" />
        <div className="text-center">
          <span className="text-[11px] text-slate-400 block">Tỷ lệ Nợ môn (F)</span>
          <span className="text-sm font-bold text-rose-500">
            {((data.filter((d) => d.grade === "F").reduce((s, d) => s + d.count, 0) / (totalCourses || 1)) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
};
