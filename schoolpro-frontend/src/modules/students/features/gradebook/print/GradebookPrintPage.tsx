import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spin } from "@/components/ui/Spin";
import { Alert } from "@/components/ui/Alert";
import { GradebookPrintActionBar } from "@/modules/students/features/gradebook/print/components";
import { useGradebookPrintData } from "@/modules/students/features/gradebook/print/hooks";
import { gradebookService } from "@/modules/students/features/gradebook/services/gradebookService";
import { buildLocalGradebookPrintHtml } from "@/modules/students/features/gradebook/utils/printGradebook";

export const GradebookPrintPage: React.FC = () => {
  const { t } = useTranslation(["card"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, summary, grades, studentProfile } = useGradebookPrintData();

  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(true);

  const autoPrint = searchParams.get("auto") === "1";

  // Load dynamic template from sys.export_templates via backend, falling back to local template
  useEffect(() => {
    let ignore = false;

    async function loadTemplate() {
      setIsRendering(true);
      try {
        const semesterParam = searchParams.get("semester") || undefined;
        const academicYearParam = searchParams.get("academicYear") || undefined;
        const res = await gradebookService.renderTranscriptPrint({
          semester: semesterParam,
          academicYear: academicYearParam,
        });

        if (!ignore && res?.html) {
          setRenderedHtml(res.html);
          setIsRendering(false);
          return;
        }
      } catch {
        // Fallback to local builder
      }

      if (!ignore) {
        const local = buildLocalGradebookPrintHtml({
          semester: searchParams.get("semester") || undefined,
          academicYear: searchParams.get("academicYear") || undefined,
          summary,
          grades,
          transcriptData: {
            studentName: studentProfile?.studentName || "Nguyễn Minh Quang",
            studentCode: studentProfile?.studentCode || "HS10A101",
            className: studentProfile?.className || summary?.className || "10A1",
            academicYear: searchParams.get("academicYear") || summary?.academicYear || "2025 – 2026",
            semester: searchParams.get("semester") || summary?.semester || "Học kỳ 1",
            schoolName: studentProfile?.schoolName || "TRƯỜNG THPT CHUYÊN HÀ NỘI - AMSTERDAM",
            principalName: studentProfile?.principalName || "TS. Lê Hồng Sơn",
            homeroomTeacher: studentProfile?.homeroomTeacher || summary?.homeroomTeacher || "Cô Trần Thị Mai",
            homeroomComment: summary?.homeroomComment || "Học sinh có ý thức tự giác học tập cao.",
            gpa: summary?.gpa || 8.72,
            academicRank: summary?.academicRank || "Tốt",
            conductRank: summary?.conductRank || "Tốt",
            titleAwarded: summary?.titleAwarded || "Học sinh Giỏi",
            rankInClass: summary?.classPosition || 3,
            totalStudents: summary?.totalClassStudents || 42,
            isPromoted: true,
            decisionNumber: "102/BĐ-THPT",
            digitalSignature: "SHA256:8f24a87c9381e9d1045fbf7632945d8b2e104ca829b3e10fa4e",
            verifiedAt: "18/10/2026 19:00",
            subjects: grades.map((g) => ({
              code: g.code,
              name: g.name,
              teacher: g.teacher,
              periodsPerWeek: g.periodsPerWeek,
              evaluationType: g.evaluationType,
              regularScoresStr: g.regularScores.map((r) => r.score).join(", "),
              midtermScore: g.midtermScore?.score,
              finalScore: g.finalScore?.score,
              averageScore: g.averageScore,
              feedbackResult: g.feedbackResult,
              gradeLevel: g.gradeLevel,
              teacherComment: g.teacherComment,
            })),
          },
        });
        setRenderedHtml(local);
        setIsRendering(false);
      }
    }

    if (!loading) {
      loadTemplate();
    }

    return () => {
      ignore = true;
    };
  }, [loading, summary, grades, studentProfile, searchParams]);

  // Trigger print dialog automatically if auto=1 query param is set
  useEffect(() => {
    if (!loading && !isRendering && !error && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, isRendering, error, autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate("/student/gradebook");
    }
  };

  // Extract dynamic CSS styles and body from the rendered HTML document
  const styleMatch = renderedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const bodyMatch = renderedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const dynamicStyles = styleMatch ? styleMatch[1] : "";
  const dynamicBody = bodyMatch ? bodyMatch[1] : renderedHtml;

  return (
    <div
      className="gradebook-dynamic-print-root min-h-screen bg-[#e9e9e9] print:bg-white text-black flex flex-col font-serif"
      style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}
    >
      {/* 1. Injected dynamic CSS from sys.export_templates */}
      {dynamicStyles && (
        <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      )}

      {/* 2. Custom action bar styling overrides */}
      <style>{`
        .gradebook-dynamic-print-root .toolbar {
          display: none !important;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* Floating Action Bar (hidden when printing) */}
      <GradebookPrintActionBar onPrint={handlePrint} onClose={handleClose} />

      {/* Dynamic Print Body */}
      <div className="flex-1 flex justify-center p-0 print:p-0">
        {loading || isRendering ? (
          <div className="flex flex-col items-center justify-center min-h-100 gap-3">
            <Spin size="large" />
            <span className="text-sm font-serif text-slate-700 font-medium">
              {t("card:gradebook.print.loading")}
            </span>
          </div>
        ) : error ? (
          <div className="max-w-md w-full p-6">
            <Alert
              type="error"
              showIcon
              title={t("card:gradebook.print.errorTitle")}
              description={error}
            />
          </div>
        ) : (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{ __html: dynamicBody }}
          />
        )}
      </div>
    </div>
  );
};

export default GradebookPrintPage;
