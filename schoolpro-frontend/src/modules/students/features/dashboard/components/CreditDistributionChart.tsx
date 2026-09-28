import React from "react";
import { Card } from "@/components/ui/Card";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { CreditByCategory } from "@/modules/students/features/dashboard/types";

interface CreditDistributionChartProps {
  data: CreditByCategory[];
}

export const CreditDistributionChart: React.FC<CreditDistributionChartProps> = ({
  data,
}) => {
  const totalEarned = data.reduce((acc, cur) => acc + cur.creditsEarned, 0);
  const totalRequired = data.reduce((acc, cur) => acc + cur.totalCredits, 0);
  const completionPercentage = totalRequired > 0 ? Math.round((totalEarned / totalRequired) * 100) : 0;

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.creditsEarned,
    totalCredits: item.totalCredits,
    itemStyle: { color: item.color },
  }));

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
      formatter: (params: unknown) => {
        const p = params as {
          name: string;
          value: number;
          percent: number;
          data: { totalCredits: number };
        };
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${p.name}</div>
          <div>Đã tích lũy: <strong>${p.value}</strong> / ${p.data.totalCredits} tín chỉ</div>
          <div style="color: #94a3b8; font-size: 11px;">Tỷ trọng khối kiến thức: ${p.percent}%</div>
        `;
      },
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 12,
      textStyle: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: 500,
      },
    },
    series: [
      {
        name: "Khối kiến thức",
        type: "pie",
        radius: ["50%", "72%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
            color: "#0f172a",
            formatter: "{b}\n{c} TC",
          },
        },
        data: chartData,
      },
    ],
  };

  return (
    <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            Phân bố Tín chỉ theo Khối kiến thức
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Tiến độ hoàn thành khung chương trình đào tạo tích lũy
        </p>
      </div>

      <div className="relative">
        <Chart option={option} height={260} />
        {/* Center Total Overlay */}
        <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-2xl font-black text-slate-800 leading-none">
            {completionPercentage}%
          </span>
          <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
            {totalEarned}/{totalRequired} TC
          </span>
        </div>
      </div>

      {/* Progress Bars Breakdown below chart */}
      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 mt-2">
        {data.map((item) => {
          const pct = Math.round((item.creditsEarned / item.totalCredits) * 100);
          return (
            <div key={item.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-[120px]">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 font-medium truncate max-w-[150px]">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <span className="text-slate-500 font-semibold text-[11px] min-w-[48px] text-right">
                  {item.creditsEarned}/{item.totalCredits} ({pct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
