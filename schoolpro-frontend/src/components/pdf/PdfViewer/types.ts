export interface PdfViewerProps {
  /**
   * Target PDF document URL or data URI to display.
   */
  fileUrl: string;

  /**
   * Custom worker URL if overriding standard unpkg or local worker.
   */
  workerUrl?: string;

  /**
   * Container CSS class name.
   */
  className?: string;

  /**
   * Callback fired when document finishes loading.
   */
  onDocumentLoadSuccess?: () => void;

  /**
   * Callback fired when an error occurs while rendering the PDF.
   */
  onError?: (error: unknown) => void;
}

export interface PdfViewerModalProps {
  /**
   * Modal visibility state.
   */
  isOpen: boolean;

  /**
   * Close modal callback.
   */
  onClose: () => void;

  /**
   * URL of the PDF document to view.
   */
  fileUrl: string;

  /**
   * Display name of the PDF file.
   */
  fileName?: string;

  /**
   * Optional formatted file size string (e.g. "1.2 MB").
   */
  fileSize?: string;
}
