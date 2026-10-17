import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardMeta, CardGrid } from "@/components/ui/Card/Card";

describe("Card", () => {
  it("renders title and children correctly", () => {
    render(
      <Card title="Card Title">
        <p>Card Content</p>
      </Card>,
    );

    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("renders skeleton when loading is true", () => {
    const { container } = render(
      <Card loading>
        <p>Hidden Content</p>
      </Card>,
    );

    expect(screen.queryByText("Hidden Content")).not.toBeInTheDocument();
    expect(container.querySelector(".ant-skeleton")).toBeInTheDocument();
  });

  it("renders CardMeta and CardGrid components", () => {
    render(
      <Card>
        <CardGrid>Grid Item</CardGrid>
        <CardMeta title="Meta Title" description="Meta Description" />
      </Card>,
    );

    expect(screen.getByText("Grid Item")).toBeInTheDocument();
    expect(screen.getByText("Meta Title")).toBeInTheDocument();
    expect(screen.getByText("Meta Description")).toBeInTheDocument();
  });
});
