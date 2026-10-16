import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin } from "@/components/ui/Spin";
import { Alert } from "antd";
import {
  GradebookPrintActionBar,
  GradebookPrintHeader,
  GradebookPrintStudentInfo,
  GradebookPrintTable,
  GradebookPrintSummary,
  GradebookPrintSignatures,
} from "./components";
import { useGradebookPrintData } from "./hooks";

export const GradebookPrintPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    loading,
    error,
    summary,
    grades,
    transcriptData,
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
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 flex flex-col font-sans">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          html, body {
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
        }
      `}</style>

      {/* Floating Action Bar (hidden when printing) */}
      <GradebookPrintActionBar onPrint={handlePrint} onClose={handleClose} />

      {/* Main Print Container */}
      <div className="flex-1 flex justify-center p-0 sm:p-6 print:p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
            <Spin size="large" />
            <span className="text-xs text-slate-500 font-medium">
              Đang tải dữ liệu bảng điểm...
            </span>
          </div>
        ) : error ? (
          <div className="max-w-md w-full p-6">
            <Alert
              type="error"
              showIcon
              message="Không thể hiển thị bảng điểm"
              description={error}
            />
          </div>
        ) : (
          <div className="print-sheet bg-white w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 sm:rounded-sm sm:shadow-md border sm:border-slate-300 print:border-none print:shadow-none print:p-0 space-y-5">
            {/* 1. Official Header */}
            <GradebookPrintHeader profile={studentProfile} />

            {/* 2. Student Info Details */}
            <GradebookPrintStudentInfo profile={studentProfile} />

            {/* 3. ERP Standard Grades Table */}
            <GradebookPrintTable grades={grades} />

            {/* 4. Academic Summary & Homeroom Remarks */}
            <GradebookPrintSummary summary={summary} />

            {/* 5. Signatures and Verification */}
            <GradebookPrintSignatures
              profile={studentProfile}
              digitalSignature={transcriptData?.digitalSignature}
              verifiedAt={transcriptData?.verifiedAt}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GradebookPrintPage;
