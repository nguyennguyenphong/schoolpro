import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SelectSort } from "@/components/sort/SelectSort/SelectSort";

describe("SelectSort Component", () => {
  it("renders with default announcement preset value", () => {
    render(<SelectSort value="newest" placeholder="Chọn cách sắp xếp" />);

    expect(screen.getByText("Mới nhất trước")).toBeInTheDocument();
  });

  it("renders with custom options", () => {
    const customOptions = [
      { value: "price_asc", label: "Giá tăng dần" },
      { value: "price_desc", label: "Giá giảm dần" },
    ];

    render(
      <SelectSort
        options={customOptions}
        value="price_asc"
      />
    );

    expect(screen.getByText("Giá tăng dần")).toBeInTheDocument();
  });

  it("renders with general preset", () => {
    render(
      <SelectSort
        preset="general"
        value="name_asc"
      />
    );

    expect(screen.getByText("Tên (A - Z)")).toBeInTheDocument();
  });

  it("renders disabled state", () => {
    const { container } = render(<SelectSort disabled />);

    expect(container.querySelector(".ant-select-disabled")).toBeInTheDocument();
  });
});
