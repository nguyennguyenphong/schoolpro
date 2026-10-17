import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StudentPagination } from "@/modules/students/components/StudentPagination";

describe("StudentPagination", () => {
  it("renders count and total with custom unit label", () => {
    const handleChange = vi.fn();
    render(
      <StudentPagination
        current={1}
        pageSize={10}
        total={45}
        itemsCount={10}
        unitLabel="mục"
        onChange={handleChange}
      />
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText(/mục/)).toBeInTheDocument();
  });

  it("returns null when total <= 0", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <StudentPagination
        current={1}
        pageSize={10}
        total={0}
        itemsCount={0}
        onChange={handleChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
