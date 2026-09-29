import React from "react";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { CompetencyAssessment } from "@/modules/students/features/dashboard/types";

interface CompetencyRadarChartProps {
  data: CompetencyAssessment[];
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({ data }) => {
  const indicators = data.map((item) => ({
    name: item.competency,
    max: 100,
  }));

  const values = data.map((item) => item.score);

  const option: EChartsOption = {
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
      formatter: () => {
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">Đánh giá Phẩm chất & Năng lực</div>
          ${data
            .map(
              (item) => `
            <div style="display: flex; justify-content: space-between; gap: 16px; font-size: 11px;">
              <span>${item.competency}:</span>
              <strong>${item.score}/100 (${item.level})</strong>
            </div>
          `,
            )
            .join("")}
        `;
      },
    },
    radar: {
      indicator: indicators,
      shape: "polygon",
      splitNumber: 4,
      radius: "52%",
      center: ["50%", "50%"],
      axisName: {
        color: "#475569",
        fontSize: 10,
        fontWeight: 500,
      },
      splitLine: {
        lineStyle: {
          color: "#e2e8f0",
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0"].reverse(),
          opacity: 0.4,
        },
      },
      axisLine: {
        lineStyle: {
          color: "#cbd5e1",
        },
      },
    },
    series: [
      {
        name: "Phẩm chất & Năng lực",
        type: "radar",
        data: [
          {
            value: values,
            name: "Học sinh",
            itemStyle: {
              color: "#3b82f6",
            },
            areaStyle: {
              color: "rgba(59, 130, 246, 0.25)",
            },
            lineStyle: {
              width: 2,
              color: "#2563eb",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="p-4 sm:p-5 border border-slate-200 bg-white rounded-xl shadow-2xs h-full flex flex-col justify-between overflow-hidden">
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            Đánh giá Phẩm chất & Năng lực (GDPT 2018)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-0">
          Tự chủ, sáng tạo, giao tiếp, chăm chỉ, trung thực & trách nhiệm
        </p>
      </div>

      <div className="w-full">
        <Chart option={option} height={280} className="w-full" />
      </div>
    </div>
  );
};
