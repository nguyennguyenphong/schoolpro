import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spin } from "@/components/ui/Spin";
import { Alert } from "@/components/ui/Alert";
import {
  GradebookPrintActionBar,
  GradebookPrintHeader,
  GradebookPrintStudentInfo,
  GradebookPrintTable,
  GradebookPrintSummary,
  GradebookPrintSignatures,
} from "@/modules/students/features/gradebook/print/components";
import { useGradebookPrintData } from "@/modules/students/features/gradebook/print/hooks";

export const GradebookPrintPage: React.FC = () => {
  const { t } = useTranslation(["card"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    loading,
    error,
    summary,
    grades,
    studentProfile,
  } = useGradebookPrintData();

  const autoPrint = searchParams.get("auto") === "1";

  // Trigger print dialog automatically if auto=1 query param is set
  useEffect(() => {
    if (!loading && !error && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, error, autoPrint]);

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

  return (
    <div className="gradebook-print-root min-h-screen bg-stone-100 print:bg-white text-black flex flex-col font-serif" style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}>
      <style>{`
        .gradebook-print-root,
        .gradebook-print-root * {
          font-family: "Times New Roman", Times, "Liberation Serif", serif !important;
        }

        @media screen {
          .print-sheet {
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 14mm 10mm 14mm;
          }
          html, body, .gradebook-print-root, .gradebook-print-root * {
            font-family: "Times New Roman", Times, "Liberation Serif", serif !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          table {
            page-break-inside: auto;
            break-inside: auto;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: auto;
          }
          td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Floating Action Bar (hidden when printing) */}
      <GradebookPrintActionBar onPrint={handlePrint} onClose={handleClose} />

      {/* Main Print Container mimicking A4 Paper Document */}
      <div className="flex-1 flex justify-center p-0 sm:p-6 print:p-0">
        {loading ? (
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
          <div className="print-sheet bg-white w-full max-w-[210mm] p-6 sm:p-[14mm_16mm_14mm_16mm] sm:shadow-md border sm:border-stone-300 print:border-none print:shadow-none print:p-0 text-black leading-normal box-border">
            {/* 1. Official National & School Header */}
            <GradebookPrintHeader profile={studentProfile} />

            {/* 2. Official Student Salutation & Information (như 1 đơn) */}
            <GradebookPrintStudentInfo profile={studentProfile} />

            {/* 3. ERP Standard Grades Table with Column Indexing (1)..(11) */}
            <GradebookPrintTable grades={grades} />

            {/* 4. Academic Evaluation & Homeroom Teacher Remarks */}
            <GradebookPrintSummary summary={summary} />

            {/* 5. Official Vietnamese 3-Party Signatures & Seal */}
            <GradebookPrintSignatures profile={studentProfile} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GradebookPrintPage;
