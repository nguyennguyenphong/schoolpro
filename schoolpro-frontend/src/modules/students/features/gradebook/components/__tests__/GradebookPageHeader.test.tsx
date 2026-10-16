import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { GradebookPageHeader } from "@/modules/students/features/gradebook/components/GradebookPageHeader";

describe("GradebookPageHeader Component", () => {
  it("renders only ONE action button for printing the gradebook", () => {
    const handlePrint = vi.fn();

    render(
      <BrowserRouter>
        <GradebookPageHeader onPrintGradebook={handlePrint} />
      </BrowserRouter>
    );

    // Assert that the print button exists
    const printButton = screen.getByRole("button", { name: /In bảng điểm|Print Gradebook/i });
    expect(printButton).toBeInTheDocument();

    // Verify there are NO other action buttons such as "Xem học bạ" or "Tải PDF"
    expect(screen.queryByRole("button", { name: /Xem học bạ|View Transcript/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tải PDF|Export PDF|Download/i })).not.toBeInTheDocument();

    // Verify clicking the print button triggers onPrintGradebook
    fireEvent.click(printButton);
    expect(handlePrint).toHaveBeenCalledTimes(1);
  });
});
