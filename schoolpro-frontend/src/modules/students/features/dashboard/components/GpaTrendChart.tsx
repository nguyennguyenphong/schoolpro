import React from "react";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { SemesterTrend } from "@/modules/students/features/dashboard/types";

interface GpaTrendChartProps {
  data: SemesterTrend[];
}

export const GpaTrendChart: React.FC<GpaTrendChartProps> = ({ data }) => {
  const semesters = data.map((d) => d.semesterName);
  const studentScores = data.map((d) => d.studentGpa);
  const classAverages = data.map((d) => d.classAverageGpa);

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["ĐTB Học sinh", "ĐTB Bình quân Lớp"],
      top: 0,
      right: 0,
      textStyle: {
        color: "#64748b",
        fontSize: 12,
        fontWeight: 500,
      },
    },
    grid: {
      left: "1%",
      right: "2%",
      bottom: "3%",
      top: "16%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: semesters,
        axisLine: {
          lineStyle: {
            color: "#cbd5e1",
          },
        },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Điểm (Thang 10)",
        min: 6,
        max: 10,
        interval: 1,
        axisLabel: {
          formatter: "{value}",
          color: "#64748b",
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#f1f5f9",
          },
        },
      },
    ],
    series: [
      {
        name: "ĐTB Học sinh",
        type: "bar",
        barWidth: 26,
        data: studentScores,
        itemStyle: {
          color: "#2563eb",
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          color: "#1e40af",
          fontWeight: "bold",
          fontSize: 11,
          formatter: "{c}",
        },
      },
      {
        name: "ĐTB Bình quân Lớp",
        type: "line",
        data: classAverages,
        smooth: true,
        symbolSize: 7,
        itemStyle: {
          color: "#f59e0b",
        },
        lineStyle: {
          width: 2.5,
          color: "#f59e0b",
        },
        label: {
          show: true,
          position: "bottom",
          color: "#b45309",
          fontSize: 10,
          formatter: "{c}",
        },
      },
    ],
  };

  return (
    <div className="p-4 sm:p-5 border border-slate-200 bg-white rounded-xl shadow-2xs h-full flex flex-col justify-between overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
              Diễn biến Điểm Trung Bình (ĐTB) qua các kỳ
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-0">
            So sánh điểm trung bình của học sinh với mức bình quân của tập thể lớp
          </p>
        </div>
      </div>

      <div className="w-full">
        <Chart option={option} height={280} className="w-full" />
      </div>
    </div>
  );
};
