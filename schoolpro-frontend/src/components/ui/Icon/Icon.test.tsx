import {
  render,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Icon,
} from "@/components/ui/Icon/Icon";

describe("Icon", () => {
  it("renders the correct icon", () => {
    const { container } =
      render(
        <Icon name="search" />,
      );

    const svg =
      container.querySelector("svg");

    expect(svg).toBeInTheDocument();
  });

  it("applies default size", () => {
    const { container } =
      render(
        <Icon name="search" />,
      );

    const svg =
      container.querySelector("svg");

    expect(svg).toHaveAttribute(
      "width",
      "20",
    );

    expect(svg).toHaveAttribute(
      "height",
      "20",
    );
  });

  it("supports custom size", () => {
    const { container } =
      render(
        <Icon
          name="search"
          size={24}
        />,
      );

    const svg =
      container.querySelector("svg");

    expect(svg).toHaveAttribute(
      "width",
      "24",
    );

    expect(svg).toHaveAttribute(
      "height",
      "24",
    );
  });

  it("supports color", () => {
    const { container } =
      render(
        <Icon
          name="search"
          color="red"
        />,
      );

    const svg =
      container.querySelector("svg");

    expect(svg).toHaveAttribute(
      "stroke",
      "red",
    );
  });

  it("supports stroke width", () => {
    const { container } =
      render(
        <Icon
          name="search"
          strokeWidth={1.5}
        />,
      );

    const svg =
      container.querySelector("svg");

    expect(svg).toHaveAttribute(
      "stroke-width",
      "1.5",
    );
  });

  it("sets aria-hidden for decorative icons", () => {
    const { container } =
      render(
        <Icon name="search" />,
      );

    const svg =
      container.querySelector("svg");

    expect(svg).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("does not hide semantic icons", () => {
    const { container } =
      render(
        <Icon
          name="search"
          aria-label="Search"
        />,
      );

    const svg =
      container.querySelector("svg");

    expect(svg).toHaveAttribute(
      "aria-label",
      "Search",
    );

    expect(svg).not.toHaveAttribute(
      "aria-hidden",
    );
  });

  it("supports className", () => {
    const { container } =
      render(
        <Icon
          name="search"
          className="custom-icon"
        />,
      );

    expect(
      container.querySelector(
        ".custom-icon",
      ),
    ).toBeInTheDocument();
  });
});
