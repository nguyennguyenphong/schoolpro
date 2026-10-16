import React from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["card", "common"]);
  const academicContext = useAuthStore((state) => state.academicContext);
  const profileContext = useAuthStore((state) => state.profileContext);

  const displayAcademicYear =
    summary?.academicYear || academicContext?.academic_year || "2025 - 2026";
  const displaySemester =
    summary?.semester || academicContext?.semester || t("card:gradebook.filters.semester1");
  const displayHomeroomTeacher =
    profileContext?.homeroom_teacher_name ||
    summary?.homeroomTeacher ||
    "SchoolPro Homeroom Teacher";
  const formatScore = (score?: number): string => {
    if (score === undefined || score === null) return "--";
    return score.toFixed(1);
  };

  const getEvaluationResultText = (item: SubjectGradeItem): string => {
    if (item.evaluationType === "feedback") {
      return item.feedbackResult === "pass"
        ? t("card:gradebook.levels.pass")
        : t("card:gradebook.levels.fail");
    }

    const score = item.averageScore || 0;
    if (score >= 8.0) return t("card:gradebook.table.studentExcellent");
    if (score >= 6.5) return t("card:gradebook.table.studentGood");
    if (score >= 5.0) return t("card:gradebook.levels.pass");
    return t("card:gradebook.levels.fail");
  };

  const columns: TableColumnsType<SubjectGradeItem> = [
    {
      title: t("card:gradebook.table.index"),
      key: "index",
      width: 60,
      align: "center",
      fixed: "left",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: t("card:gradebook.table.subject"),
      key: "name",
      width: 200,
      fixed: "left",
      render: (_value, record) => (
        <div>
          <div className="font-bold text-slate-900">{record.name}</div>
          <div className="text-xs text-slate-500">
            {t("card:gradebook.table.subjectCode", { code: record.code })}
          </div>
        </div>
      ),
    },
    {
      title: t("card:gradebook.table.teacherHeading"),
      key: "teacher",
      width: 200,
      render: (_value, record) => (
        <div>
          <div className="font-medium text-slate-800">{record.teacher}</div>
        </div>
      ),
    },
    {
      title: t("card:gradebook.table.regularScoresHeading"),
      children: [
        {
          title: t("card:gradebook.table.regularScore1"),
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
          title: t("card:gradebook.table.regularScore2"),
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
          title: t("card:gradebook.table.regularScore3"),
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
          title: t("card:gradebook.table.regularScore4"),
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
      title: t("card:gradebook.table.midtermScoreHeading"),
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
      title: t("card:gradebook.table.finalScoreHeading"),
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
      title: t("card:gradebook.table.averageScoreHeading"),
      dataIndex: "averageScore",
      key: "averageScore",
      align: "center",
      width: 120,
      render: (_value, record) => {
        if (record.evaluationType === "feedback") {
          return record.feedbackResult === "pass"
            ? t("card:gradebook.levels.pass")
            : t("card:gradebook.levels.fail");
        }
        return <span className="font-bold text-slate-900">{formatScore(record.averageScore)}</span>;
      },
    },
    {
      title: t("card:gradebook.table.gradeLevelHeading"),
      dataIndex: "gradeLevel",
      key: "gradeLevel",
      align: "center",
      width: 150,
      render: (_value, record) => getEvaluationResultText(record),
    },
    {
      title: t("card:gradebook.table.classStatsHeading"),
      children: [
        {
          title: t("card:gradebook.table.classAverageScore"),
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
          title: t("card:gradebook.table.highestScore"),
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
      title: t("card:gradebook.table.teacherCommentHeading"),
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
                {t("card:gradebook.empty.noMatchingTitle")}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {t("card:gradebook.empty.noMatchingDesc")}
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
                      {t("card:gradebook.summary.homeroomTeacher")} <strong>{displayHomeroomTeacher}</strong>
                    </div>
                  </div>
                </Table.Summary.Cell>

                <Table.Summary.Cell index={1} colSpan={6} align="center">
                  <span className="text-xs font-normal text-slate-600">
                    {t("card:gradebook.table.summarySubjectsStats", {
                      total: summary.totalSubjectsCount,
                      excellent: summary.excellentSubjectsCount,
                      pass: summary.passSubjectsCount,
                    })}
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
                    {t("card:gradebook.table.conductRankLabel")} <strong>{summary.conductRank}</strong>
                    <span className="mx-2">|</span>
                    {t("card:gradebook.table.classRankSummary", {
                      rank: summary.classPosition,
                      total: summary.totalClassStudents,
                    })}
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
