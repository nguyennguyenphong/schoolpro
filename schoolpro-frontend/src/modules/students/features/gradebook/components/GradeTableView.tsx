import React from "react";
import { Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
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
        <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <Icon name="check" size={12} />
          <span>{feedbackResult === "pass" ? "ĐẠT" : "CHƯA ĐẠT"}</span>
        </span>
      );
    }

    if (score === undefined) return <span className="text-slate-300 font-mono">--</span>;

    let badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
    if (score >= 9.0) {
      badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
    } else if (score >= 8.0) {
      badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
    } else if (score >= 6.5) {
      badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
    } else {
      badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
    }

    return (
      <span
        className={`inline-flex items-center justify-center font-black text-sm min-w-[40px] py-0.5 px-2 rounded border shadow-2xs whitespace-nowrap ${badgeColor}`}
      >
        {score.toFixed(1)}
      </span>
    );
  };

  const getGradeLevelTag = (item: SubjectGradeItem) => {
    if (item.evaluationType === "feedback") {
      return (
        <Tag color="green" className="m-0 font-semibold text-xs whitespace-nowrap">
          Hoàn thành tốt
        </Tag>
      );
    }

    const score = item.averageScore || 0;
    if (score >= 9.0) {
      return (
        <Tag color="geekblue" className="m-0 font-bold text-xs whitespace-nowrap">
          Xuất sắc
        </Tag>
      );
    }
    if (score >= 8.0) {
      return (
        <Tag color="blue" className="m-0 font-bold text-xs whitespace-nowrap">
          Giỏi
        </Tag>
      );
    }
    if (score >= 6.5) {
      return (
        <Tag color="orange" className="m-0 font-semibold text-xs whitespace-nowrap">
          Khá
        </Tag>
      );
    }
    return (
      <Tag color="red" className="m-0 font-semibold text-xs whitespace-nowrap">
        Đạt
      </Tag>
    );
  };

  const columns: TableColumnsType<SubjectGradeItem> = [
    {
      title: "STT",
      key: "index",
      width: 55,
      align: "center",
      className: "whitespace-nowrap",
      render: (_value, _record, index) => (
        <span className="text-slate-400 font-medium text-xs">{index + 1}</span>
      ),
    },
    {
      title: "Môn học",
      key: "name",
      width: 220,
      className: "whitespace-nowrap",
      render: (_value, record) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-bold text-slate-900 text-sm">
              {record.name}
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
              {record.code}
            </span>
          </div>
          <div className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Icon name="user" size={11} className="text-slate-400" />
            <span>{record.teacher}</span>
            <span>•</span>
            <span>{record.periodsPerWeek} tiết/tuần</span>
          </div>
        </div>
      ),
    },
    {
      title: "Thường xuyên (x1)",
      dataIndex: "regularScores",
      key: "regularScores",
      align: "center",
      width: 175,
      className: "whitespace-nowrap",
      render: (scores: SubjectGradeItem["regularScores"]) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          {scores.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-800 font-semibold text-xs"
              title={`${s.name}: ${s.score}`}
            >
              {s.score.toFixed(1)}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Giữa kỳ (x2)",
      dataIndex: "midtermScore",
      key: "midtermScore",
      align: "center",
      width: 105,
      className: "whitespace-nowrap",
      render: (midterm?: SubjectGradeItem["midtermScore"]) =>
        midterm ? (
          <span
            className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 whitespace-nowrap"
            title={`${midterm.name}: ${midterm.score}`}
          >
            {midterm.score.toFixed(1)}
          </span>
        ) : (
          <span className="text-slate-300 font-mono">--</span>
        ),
    },
    {
      title: "Cuối kỳ (x3)",
      dataIndex: "finalScore",
      key: "finalScore",
      align: "center",
      width: 105,
      className: "whitespace-nowrap",
      render: (final?: SubjectGradeItem["finalScore"]) =>
        final ? (
          <span
            className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold text-xs border border-purple-200 whitespace-nowrap"
            title={`${final.name}: ${final.score}`}
          >
            {final.score.toFixed(1)}
          </span>
        ) : (
          <span className="text-slate-300 font-mono">--</span>
        ),
    },
    {
      title: "ĐTB Môn",
      dataIndex: "averageScore",
      key: "averageScore",
      align: "center",
      width: 105,
      className: "whitespace-nowrap",
      render: (_value, record) =>
        getAverageScoreBadge(
          record.averageScore,
          record.evaluationType === "feedback",
          record.feedbackResult,
        ),
    },
    {
      title: "Xếp loại",
      dataIndex: "gradeLevel",
      key: "gradeLevel",
      align: "center",
      width: 110,
      className: "whitespace-nowrap",
      render: (_value, record) => getGradeLevelTag(record),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 90,
      className: "whitespace-nowrap",
      render: (_value, record) => (
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(record);
          }}
          className="text-slate-700 font-medium"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-2xs overflow-hidden">
      <Table<SubjectGradeItem>
        rowKey="id"
        columns={columns}
        dataSource={grades}
        pagination={false}
        scroll={{ x: 1150 }}
        onRow={(record) => ({
          onClick: () => onOpenDetail(record),
          className: "cursor-pointer",
        })}
        summary={() =>
          summary ? (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-slate-50/80 font-bold">
                <Table.Summary.Cell index={0} colSpan={2} className="whitespace-nowrap">
                  <div className="py-1 px-1">
                    <span className="text-sm font-bold text-blue-900 whitespace-nowrap">
                      TỔNG KẾT HỌC KỲ 1 (2025 - 2026)
                    </span>
                    <div className="text-xs text-slate-500 font-normal mt-0.5 whitespace-nowrap">
                      GVCN: <strong>{summary.homeroomTeacher}</strong> • Học bạ điện tử xác thực
                    </div>
                  </div>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={1} colSpan={3} align="center" className="whitespace-nowrap">
                  <span className="text-xs text-slate-600 font-normal whitespace-nowrap">
                    11 môn tính điểm số • 2 môn nhận xét Đạt
                  </span>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={2} align="center" className="whitespace-nowrap">
                  <span className="inline-flex items-center justify-center font-black text-sm px-2.5 py-1 rounded bg-blue-600 text-white whitespace-nowrap">
                    {summary.gpa.toFixed(2)}
                  </span>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={3} align="center" className="whitespace-nowrap">
                  <Tag color="geekblue" className="font-bold m-0 whitespace-nowrap">
                    {summary.academicRank}
                  </Tag>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={4} colSpan={2} className="whitespace-nowrap">
                  <div className="text-xs text-slate-600 py-1 whitespace-nowrap">
                    Hạnh kiểm: <strong className="text-emerald-700">{summary.conductRank}</strong>
                    <span className="mx-2">•</span>
                    Thứ hạng: <strong className="text-amber-700">Hạng {summary.classPosition}/{summary.totalClassStudents}</strong>
                  </div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          ) : undefined
        }
      />
    </div>
  );
};
