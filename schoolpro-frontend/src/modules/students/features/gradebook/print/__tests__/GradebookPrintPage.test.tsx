import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { GradebookPrintPage } from "@/modules/students/features/gradebook/print/GradebookPrintPage";

describe("GradebookPrintPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the print sheet with all required official blocks", async () => {
    render(
      <BrowserRouter>
        <GradebookPrintPage />
      </BrowserRouter>
    );

    // Wait for data loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Đang tải dữ liệu/i)).not.toBeInTheDocument();
    });

    // Check national header and title
    expect(
      screen.getByText(/CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM|SOCIALIST REPUBLIC OF VIETNAM/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/BẢNG ĐIỂM HỌC TẬP VÀ RÈN LUYỆN|STUDENT ACADEMIC & CONDUCT TRANSCRIPT/i)
    ).toBeInTheDocument();

    // Check action bar with Print button
    const printNowButton = screen.getByRole("button", { name: /In ngay|Print Now/i });
    expect(printNowButton).toBeInTheDocument();

    // Verify absence of old extraction text and footer authentication/date
    expect(
      screen.queryByText(/Trích xuất từ Hệ thống Quản lý Học vụ SchoolPro/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Mã chứng thực|Authentication Code|Auth Code/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ngày tạo|Created Date/i)
    ).not.toBeInTheDocument();

    // Mock window.print
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    fireEvent.click(printNowButton);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
