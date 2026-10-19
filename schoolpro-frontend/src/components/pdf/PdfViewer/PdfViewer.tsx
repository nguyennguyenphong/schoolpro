import React from "react";
import { useTranslation } from "react-i18next";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Spin } from "@/components/ui/Spin";
import type { PdfViewerProps } from "@/components/pdf/PdfViewer/types";

const DEFAULT_WORKER_URL = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

/**
 * Enterprise PDF Viewer component powered by @react-pdf-viewer
 * Provides full zoom, pagination, search, rotation and print toolbars.
 */
export const PdfViewer: React.FC<PdfViewerProps> = ({
  fileUrl,
  workerUrl = DEFAULT_WORKER_URL,
  className = "h-[70vh] w-full",
  onDocumentLoadSuccess,
  onError,
}) => {
  const { t } = useTranslation(["modal"]);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className={`border border-[#f0f0f0] rounded-lg overflow-hidden bg-slate-100 ${className}`}>
      <Worker workerUrl={workerUrl}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
          renderLoader={() => (
            <div className="flex flex-col items-center justify-center h-full min-h-75 gap-3 text-slate-500">
              <Spin size="large" />
              <span className="text-xs font-medium">{t("modal:pdfViewer.loading")}</span>
            </div>
          )}
          renderError={(error) => {
            onError?.(error);
            return (
              <div className="flex flex-col items-center justify-center h-full min-h-75 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold">!</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">
                  {t("modal:pdfViewer.errorTitle")}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  {t("modal:pdfViewer.errorDesc")}
                </p>
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  {t("modal:pdfViewer.downloadToView")}
                </a>
              </div>
            );
          }}
          onDocumentLoad={() => {
            onDocumentLoadSuccess?.();
          }}
        />
      </Worker>
    </div>
  );
};

PdfViewer.displayName = "PdfViewer";
