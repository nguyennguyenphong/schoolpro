import React from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import type { SubjectGradeItem, GradeSummary } from "@/modules/students/features/gradebook/types";
import { useAuthStore } from "@/shared/store/useAuthStore";

interface GradeTableViewProps {
  grades: SubjectGradeItem[];
  summary: GradeSummary | null;
  onOpenDetail?: (item: SubjectGradeItem) => void;
}

export const GradeTableView: React.FC<GradeTableViewProps> = ({
  grades,
  summary,
}) => {
  const academicContext = useAuthStore((state) => state.academicContext);
  const profileContext = useAuthStore((state) => state.profileContext);

  const displayAcademicYear =
    summary?.academicYear || academicContext?.academic_year || "Năm học 2025 - 2026";
  const displaySemester =
    summary?.semester || academicContext?.semester || "Học kỳ 1";
  const displayHomeroomTeacher =
    summary?.homeroomTeacher || profileContext?.homeroom_teacher_name || "Thầy Nguyễn Văn Nam";
  const formatScore = (score?: number): string => {
    if (score === undefined || score === null) return "--";
    return score.toFixed(1);
  };

  const getEvaluationResultText = (item: SubjectGradeItem): string => {
    if (item.evaluationType === "feedback") {
      return item.feedbackResult === "pass" ? "Đạt" : "Chưa đạt";
    }

    const score = item.averageScore || 0;
    if (score >= 8.0) return "Học sinh Giỏi";
    if (score >= 6.5) return "Học sinh Khá";
    if (score >= 5.0) return "Đạt";
    return "Chưa đạt";
  };

  const columns: TableColumnsType<SubjectGradeItem> = [
    {
      title: "Số thứ tự",
      key: "index",
      width: 75,
      align: "center",
      fixed: "left",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "Môn học",
      key: "name",
      width: 200,
      fixed: "left",
      render: (_value, record) => (
        <div>
          <div className="font-bold text-slate-900">{record.name}</div>
          <div className="text-xs text-slate-500">Mã môn học: {record.code}</div>
        </div>
      ),
    },
    {
      title: "Giáo viên bộ môn",
      key: "teacher",
      width: 200,
      render: (_value, record) => (
        <div>
          <div className="font-medium text-slate-800">{record.teacher}</div>
        </div>
      ),
    },
    {
      title: "Đánh giá thường xuyên (Hệ số 1)",
      children: [
        {
          title: "Lần 1",
          key: "regularScore1",
          align: "center",
          width: 75,
          render: (_value, record) => {
            if (record.evaluationType === "feedback") return "--";
            return record.regularScores[0]
              ? formatScore(record.regularScores[0].score)
              : "--";
          },
        },
        {
          title: "Lần 2",
          key: "regularScore2",
          align: "center",
          width: 75,
          render: (_value, record) => {
            if (record.evaluationType === "feedback") return "--";
            return record.regularScores[1]
              ? formatScore(record.regularScores[1].score)
              : "--";
          },
        },
        {
          title: "Lần 3",
          key: "regularScore3",
          align: "center",
          width: 75,
          render: (_value, record) => {
            if (record.evaluationType === "feedback") return "--";
            return record.regularScores[2]
              ? formatScore(record.regularScores[2].score)
              : "--";
          },
        },
        {
          title: "Lần 4",
          key: "regularScore4",
          align: "center",
          width: 75,
          render: (_value, record) => {
            if (record.evaluationType === "feedback") return "--";
            return record.regularScores[3]
              ? formatScore(record.regularScores[3].score)
              : "--";
          },
        },
      ],
    },
    {
      title: "Đánh giá giữa kỳ (Hệ số 2)",
      dataIndex: "midtermScore",
      key: "midtermScore",
      align: "center",
      width: 110,
      render: (midterm?: SubjectGradeItem["midtermScore"], record?: SubjectGradeItem) => {
        if (record?.evaluationType === "feedback") return "--";
        return midterm ? formatScore(midterm.score) : "--";
      },
    },
    {
      title: "Đánh giá cuối kỳ (Hệ số 3)",
      dataIndex: "finalScore",
      key: "finalScore",
      align: "center",
      width: 110,
      render: (final?: SubjectGradeItem["finalScore"], record?: SubjectGradeItem) => {
        if (record?.evaluationType === "feedback") return "--";
        return final ? formatScore(final.score) : "--";
      },
    },
    {
      title: "Điểm trung bình môn học",
      dataIndex: "averageScore",
      key: "averageScore",
      align: "center",
      width: 120,
      render: (_value, record) => {
        if (record.evaluationType === "feedback") {
          return record.feedbackResult === "pass" ? "Đạt" : "Chưa đạt";
        }
        return <span className="font-bold text-slate-900">{formatScore(record.averageScore)}</span>;
      },
    },
    {
      title: "Xếp loại môn học",
      dataIndex: "gradeLevel",
      key: "gradeLevel",
      align: "center",
      width: 120,
      render: (_value, record) => getEvaluationResultText(record),
    },
    {
      title: "Thống kê lớp học",
      children: [
        {
          title: "Điểm trung bình lớp",
          dataIndex: "classAverage",
          key: "classAverage",
          align: "center",
          width: 100,
          render: (classAvg?: number, record?: SubjectGradeItem) => {
            if (record?.evaluationType === "feedback" || classAvg === undefined) {
              return "--";
            }
            return formatScore(classAvg);
          },
        },
        {
          title: "Điểm cao nhất lớp",
          dataIndex: "highestScore",
          key: "highestScore",
          align: "center",
          width: 100,
          render: (highest?: number, record?: SubjectGradeItem) => {
            if (record?.evaluationType === "feedback" || highest === undefined) {
              return "--";
            }
            return formatScore(highest);
          },
        },
      ],
    },
    {
      title: "Nhận xét của giáo viên bộ môn",
      dataIndex: "teacherComment",
      key: "teacherComment",
      width: 280,
      render: (comment: string) => comment || "--",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-2xs">
      <Table<SubjectGradeItem>
        rowKey="id"
        bordered
        columns={columns}
        dataSource={grades}
        pagination={false}
        scroll={{ x: 1450 }}
        locale={{
          emptyText: (
            <div className="py-12 text-center text-slate-500">
              <div className="text-base font-semibold text-slate-700">
                Không tìm thấy môn học nào phù hợp
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Vui lòng thử thay đổi điều kiện tìm kiếm hoặc chọn học kỳ khác.
              </div>
            </div>
          ),
        }}
        summary={() =>
          summary ? (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-slate-50 font-bold">
                <Table.Summary.Cell index={0} colSpan={3}>
                  <div className="py-1 text-slate-800">
                    <div>
                      {displayAcademicYear} / {displaySemester}
                    </div>
                    <div className="text-xs font-normal text-slate-500 mt-0.5">
                      Giáo viên chủ nhiệm: <strong>{displayHomeroomTeacher}</strong>
                    </div>
                  </div>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={1} colSpan={6} align="center">
                  <span className="text-xs font-normal text-slate-600">
                    Tổng số môn học: {summary.totalSubjectsCount} | Môn Giỏi: {summary.excellentSubjectsCount} | Môn Đạt: {summary.passSubjectsCount}
                  </span>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={2} align="center">
                  <span className="font-bold text-slate-900">
                    {summary.gpa.toFixed(2)}
                  </span>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={3} align="center">
                  <span className="font-semibold text-slate-800">
                    {summary.academicRank}
                  </span>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={4} colSpan={3}>
                  <div className="text-xs text-slate-600 py-1">
                    Xếp loại rèn luyện: <strong>{summary.conductRank}</strong>
                    <span className="mx-2">•</span>
                    Xếp hạng lớp: <strong>{summary.classPosition}</strong> / {summary.totalClassStudents} học sinh
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
