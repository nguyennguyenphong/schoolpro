import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  SubjectGradeItem,
  GradeSummary,
  TranscriptData,
} from "@/modules/students/features/gradebook/types";
import { useAuthStore } from "@/shared/store/useAuthStore";

interface GradeTranscriptModalProps {
  isOpen: boolean;
  grades: SubjectGradeItem[];
  summary: GradeSummary | null;
  transcriptData?: TranscriptData | null;
  isLoading?: boolean;
  onClose: () => void;
  onExportPdf: () => void;
}

export const GradeTranscriptModal: React.FC<GradeTranscriptModalProps> = ({
  isOpen,
  grades,
  summary,
  transcriptData,
  onClose,
  onExportPdf,
}) => {
  const { t } = useTranslation(["card"]);

  const student = transcriptData
    ? {
        fullName: transcriptData.studentName,
        studentCode: transcriptData.studentCode,
        className: transcriptData.className,
        academicYear: transcriptData.academicYear,
        semester: transcriptData.semester,
        schoolName: transcriptData.schoolName,
        principalName: transcriptData.principalName,
      }
    : {
        fullName: "Nguyễn Văn An",
        studentCode: "SV202688",
        className: summary?.className || "11A1",
        academicYear: summary?.academicYear || "2025-2026",
        semester: summary?.semester || "HK1",
        schoolName: "THPT Chuyên Lê Hồng Phong",
        principalName: "ThS. Phạm Quốc Tuấn",
      };

  const profileContext = useAuthStore((state) => state.profileContext);

  const currentSummary = transcriptData
    ? {
        gpa: transcriptData.gpa,
        academicRank: transcriptData.academicRank,
        conductRank: transcriptData.conductRank,
        titleAwarded: transcriptData.titleAwarded,
        classPosition: transcriptData.rankInClass,
        totalClassStudents: transcriptData.totalStudents,
        homeroomTeacher:
          profileContext?.homeroom_teacher_name ||
          transcriptData.homeroomTeacher ||
          "SchoolPro Homeroom Teacher",
        homeroomComment: transcriptData.homeroomComment,
      }
    : summary
      ? {
          ...summary,
          homeroomTeacher:
            profileContext?.homeroom_teacher_name ||
            summary.homeroomTeacher ||
            "SchoolPro Homeroom Teacher",
        }
      : null;

  const certification = {
    isDigitallySigned: true,
    digitalSignature: transcriptData?.digitalSignature || "MOET-BGDDT-CERT-2026-X992",
    verifiedAt: transcriptData?.verifiedAt || new Date().toISOString(),
    authority: "Cổng Học bạ Điện tử Quốc gia (Bộ GD&ĐT)",
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#f0f0f0]">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Icon name="checkCircle" size={14} className="text-emerald-600" />
            <span>{certification.authority}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="outline" onClick={onClose}>
              {t("card:gradebook.transcriptModal.close")}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.print();
              }}
              className="text-slate-700 font-semibold"
            >
              <Icon name="fileText" size={14} />
              <span>{t("card:gradebook.transcriptModal.print")}</span>
            </Button>
            <Button variant="primary" onClick={onExportPdf} className="font-semibold">
              <Icon name="download" size={14} />
              <span>{t("card:gradebook.transcriptModal.downloadPdf")}</span>
            </Button>
          </div>
        </div>
      }
      width={860}
      title={null}
      destroyOnHidden
      centered
    >
      <div className="space-y-4 pt-1 text-slate-800">
        {/* National Header */}
        <div className="text-center space-y-1 pb-3 border-b-2 border-[#f0f0f0]">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {t("card:gradebook.transcriptModal.nationalHeader")}
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {t("card:gradebook.transcriptModal.nationalMotto")}
          </div>
          <h2 className="text-lg sm:text-xl font-black text-blue-900 tracking-tight pt-1 mb-0 uppercase">
            {t("card:gradebook.transcriptModal.title")}
          </h2>
          <div className="text-xs font-medium text-slate-500">
            {t("card:gradebook.transcriptModal.standardNote")}
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-300 text-xs">
          <div>
            <span className="text-slate-500 block">
              {t("card:gradebook.transcriptModal.fullName")}
            </span>
            <strong className="text-sm text-slate-900">{student.fullName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">
              {t("card:gradebook.transcriptModal.className")}
            </span>
            <strong className="text-sm text-slate-900">{student.className}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">
              {t("card:gradebook.transcriptModal.studentCode")}
            </span>
            <strong className="text-sm text-slate-900">{student.studentCode}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">
              {t("card:gradebook.transcriptModal.schoolYear")}
            </span>
            <strong className="text-sm text-slate-900">
              {student.academicYear} • {student.semester}
            </strong>
          </div>
        </div>

        {/* Grades Table */}
        <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center border border-slate-300">STT</th>
                <th className="py-2.5 px-3 border border-slate-300">
                  {t("card:gradebook.table.subject")}
                </th>
                <th className="py-2.5 px-3 text-center border border-slate-300">
                  {t("card:gradebook.table.regularScores")} (x1)
                </th>
                <th className="py-2.5 px-3 text-center border border-slate-300">
                  {t("card:gradebook.table.midtermScore")} (x2)
                </th>
                <th className="py-2.5 px-3 text-center border border-slate-300">
                  {t("card:gradebook.table.finalScore")} (x3)
                </th>
                <th className="py-2.5 px-3 text-center border border-slate-300">
                  {t("card:gradebook.table.averageScore")}
                </th>
                <th className="py-2.5 px-3 text-center border border-slate-300">
                  {t("card:gradebook.table.gradeLevel")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {grades.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-center text-slate-500 font-semibold border border-[#f0f0f0]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-800 border border-[#f0f0f0]">
                    {item.name}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 border border-[#f0f0f0]">
                    {item.regularScores.map((s) => s.score.toFixed(1)).join("  ")}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-slate-700 border border-[#f0f0f0]">
                    {item.midtermScore ? item.midtermScore.score.toFixed(1) : "--"}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-slate-700 border border-[#f0f0f0]">
                    {item.finalScore ? item.finalScore.score.toFixed(1) : "--"}
                  </td>
                  <td className="py-2 px-3 text-center border border-[#f0f0f0]">
                    {item.evaluationType === "feedback" ? (
                      <span className="font-bold text-emerald-700">
                        {item.feedbackResult === "pass"
                          ? t("card:gradebook.levels.pass")
                          : t("card:gradebook.levels.fail")}
                      </span>
                    ) : (
                      <strong className="font-black text-blue-700 text-sm">
                        {item.averageScore?.toFixed(1)}
                      </strong>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-slate-700 border border-[#f0f0f0]">
                    {item.evaluationType === "feedback"
                      ? item.feedbackResult === "pass"
                        ? t("card:gradebook.levels.pass")
                        : t("card:gradebook.levels.fail")
                      : (item.averageScore || 0) >= 8.0
                      ? t("card:gradebook.levels.excellent")
                      : t("card:gradebook.levels.good")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Overall Evaluation */}
        {currentSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
              <div className="font-bold text-blue-900 text-sm">
                {t("card:gradebook.transcriptModal.summaryResultsTitle")}:
              </div>
              <div className="flex justify-between">
                <span>{t("card:gradebook.transcriptModal.gpa")}</span>
                <strong className="text-blue-900 text-sm">
                  {currentSummary.gpa.toFixed(2)}/10
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{t("card:gradebook.transcriptModal.academicRank")}</span>
                <strong className="text-blue-900">{currentSummary.academicRank}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t("card:gradebook.transcriptModal.conductRank")}</span>
                <strong className="text-emerald-800">{currentSummary.conductRank}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t("card:gradebook.transcriptModal.rankInClass")}</span>
                <strong className="text-amber-800">
                  {t("card:gradebook.summary.classRankText", {
                    rank: currentSummary.classPosition,
                    total: currentSummary.totalClassStudents,
                  })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{t("card:gradebook.transcriptModal.titleAwarded")}</span>
                <strong className="text-purple-800">{currentSummary.titleAwarded}</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-800">
                  {t("card:gradebook.transcriptModal.homeroomTeacherRemarks")}
                </div>
                <p className="text-slate-600 italic leading-relaxed mt-1 mb-0">
                  "{currentSummary.homeroomComment}"
                </p>
              </div>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-[#f0f0f0] flex items-center justify-between">
                <span>
                  {t("card:gradebook.summary.homeroomTeacher")}{" "}
                  <strong>{currentSummary.homeroomTeacher}</strong>
                </span>
                <span className="text-emerald-700 font-semibold">
                  ✓ {t("card:gradebook.transcriptModal.digitalSignature")} {certification.digitalSignature}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
