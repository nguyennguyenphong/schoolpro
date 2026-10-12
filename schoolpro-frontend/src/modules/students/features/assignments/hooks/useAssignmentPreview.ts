
import { useCallback, useState } from "react";
import type { SubmittedFile } from "@/modules/students/features/assignments/types";

interface PreviewPdf {
  url: string;
  name: string;
  size: string;
}

export const useAssignmentPreview = () => {
  const [previewFile, setPreviewFile] =
    useState<SubmittedFile | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<PreviewPdf | null>(null);

  const handlePreview = useCallback((file: SubmittedFile) => {
    const isPdf =
      file.type === "pdf" ||
      file.name.toLowerCase().endsWith(".pdf") ||
      Boolean(file.url?.toLowerCase().endsWith(".pdf"));

    if (isPdf) {
      setPreviewPdf({
        url: file.previewUrl || file.url || "/sample-notice.pdf",
        name: file.name,
        size: file.size,
      });

      return;
    }

    setPreviewFile(file);
    setPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewFile(null);
  }, []);

  const closePdfPreview = useCallback(() => {
    setPreviewPdf(null);
  }, []);

  return {
    previewFile,
    previewOpen,
    previewPdf,
    handlePreview,
    handleClosePreview,
    closePdfPreview,
    setPreviewPdf,
    setPreviewFile,
    setPreviewOpen,
  };
};
