import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PdfViewer } from "@/components/pdf/PdfViewer/PdfViewer";
import type { PdfViewerModalProps } from "@/components/pdf/PdfViewer/types";

const FALLBACK_PDF_URL = "/sample-notice.pdf";

/**
 * Responsive modal for previewing PDF files in announcements and academic records.
 */
export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileSize,
}) => {
  const { t } = useTranslation(["modal", "button"]);
  const resolvedFileName = fileName || t("modal:pdfViewer.defaultFileName");

  // Use fallback sample document if fileUrl is dummy '#' or empty
  const resolvedUrl =
    !fileUrl || fileUrl.trim() === "#" || fileUrl.trim() === ""
      ? FALLBACK_PDF_URL
      : fileUrl;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = resolvedUrl;
    link.download = resolvedFileName;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      className="pdf-viewer-modal"
      title={
        <div className="flex items-center justify-between gap-3 pr-6 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Icon name="file" size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate mb-0" title={resolvedFileName}>
                {resolvedFileName}
              </h3>
              {fileSize && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {t("modal:pdfViewer.fileSize", { size: fileSize })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="text-xs"
            >
              <Icon name="download" size={13} />
              <span>{t("button:download")}</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="py-2">
        {isOpen && (
          <PdfViewer
            fileUrl={resolvedUrl}
            className="h-[72vh] w-full"
          />
        )}
      </div>

      <div className="flex items-center justify-end pt-3 border-t border-[#f0f0f0]">
        <Button variant="primary" onClick={onClose}>
          {t("button:close")}
        </Button>
      </div>
    </Modal>
  );
};

PdfViewerModal.displayName = "PdfViewerModal";
