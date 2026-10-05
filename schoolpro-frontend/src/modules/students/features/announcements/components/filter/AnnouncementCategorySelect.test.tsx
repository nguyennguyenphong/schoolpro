import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnnouncementCategorySelect } from "./AnnouncementCategorySelect";

describe("AnnouncementCategorySelect", () => {
  it("renders with default category value", () => {
    const handleChange = vi.fn();
    render(
      <AnnouncementCategorySelect
        value="all"
        onChange={handleChange}
      />
    );

    expect(screen.getByText("Tất cả chuyên mục")).toBeInTheDocument();
  });

  it("renders with custom dynamic categories", () => {
    const handleChange = vi.fn();
    const dynamicList = [
      { value: "exam", label: "Khảo thí", count: 3 },
      { value: "activity", label: "Phong trào", count: 7 },
    ];

    render(
      <AnnouncementCategorySelect
        value="exam"
        onChange={handleChange}
        categories={dynamicList}
      />
    );

    expect(screen.getByText("Khảo thí (3)")).toBeInTheDocument();
  });
});
