import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PdfViewerModal } from "./PdfViewerModal";

// Mock @react-pdf-viewer/core and @react-pdf-viewer/default-layout to avoid canvas/worker in jsdom
vi.mock("@react-pdf-viewer/core", () => ({
  Worker: ({ children }: { children: React.ReactNode }) => <div data-testid="pdf-worker">{children}</div>,
  Viewer: ({ fileUrl }: { fileUrl: string }) => <div data-testid="pdf-viewer" data-url={fileUrl}>Viewer Content</div>,
}));

vi.mock("@react-pdf-viewer/default-layout", () => ({
  defaultLayoutPlugin: () => ({}),
}));

describe("PdfViewerModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    fileUrl: "/sample-notice.pdf",
    fileName: "Lich_thi_giua_ky_1.pdf",
    fileSize: "1.5 MB",
  };

  it("renders modal header with document title and size", () => {
    render(<PdfViewerModal {...defaultProps} />);

    expect(screen.getByText("Lich_thi_giua_ky_1.pdf")).toBeInTheDocument();
    expect(screen.getByText("Dung lượng: 1.5 MB")).toBeInTheDocument();
  });

  it("renders download button and close button", () => {
    render(<PdfViewerModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: /tải xuống/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /đóng/i })).toBeInTheDocument();
  });

  it("calls onClose when Close button is clicked", () => {
    render(<PdfViewerModal {...defaultProps} />);

    const closeBtn = screen.getByRole("button", { name: /đóng/i });
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("falls back to sample-notice.pdf if fileUrl is dummy '#'", () => {
    render(<PdfViewerModal {...defaultProps} fileUrl="#" />);

    const viewer = screen.getByTestId("pdf-viewer");
    expect(viewer).toHaveAttribute("data-url", "/sample-notice.pdf");
  });
});
