import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SelectPriority } from "@/components/priority/SelectPriority/SelectPriority";

describe("SelectPriority Component", () => {
  it("renders with default allOption and placeholder", () => {
    render(<SelectPriority value="all" placeholder="Chọn mức độ ưu tiên" />);

    expect(screen.getByText("Tất cả mức độ")).toBeInTheDocument();
  });

  it("renders without allOption when includeAllOption is false", () => {
    render(
      <SelectPriority
        includeAllOption={false}
        placeholder="Chọn mức độ"
      />
    );

    expect(screen.queryByText("Tất cả mức độ")).not.toBeInTheDocument();
  });

  it("renders with custom placeholder and className", () => {
    const { container } = render(
      <SelectPriority
        placeholder="Bộ lọc độ ưu tiên"
        className="custom-priority-class"
      />
    );

    expect(container.querySelector(".custom-priority-class")).toBeInTheDocument();
  });

  it("accepts custom priorities", () => {
    const customList = [
      { id: "p1", code: "P1", name: "Rất gấp", level: 1 },
      { id: "p2", code: "P2", name: "Bình thường", level: 2 },
    ];

    render(
      <SelectPriority
        includeAllOption={false}
        customPriorities={customList}
        value="p1"
      />
    );

    expect(screen.getByText("Rất gấp")).toBeInTheDocument();
  });

  it("renders disabled state", () => {
    const { container } = render(<SelectPriority disabled />);

    expect(container.querySelector(".ant-select-disabled")).toBeInTheDocument();
  });
});
