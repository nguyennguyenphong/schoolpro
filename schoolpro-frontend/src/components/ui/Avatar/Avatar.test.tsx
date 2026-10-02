import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Avatar } from "@/components/ui/Avatar/Avatar";

describe("Avatar", () => {
  describe("rendering", () => {
    it("renders text content correctly", () => {
      render(<Avatar>John</Avatar>);

      expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("renders image avatar with src and alt", () => {
      render(
        <Avatar
          src="https://example.com/avatar.png"
          alt="User Profile"
        />,
      );

      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/avatar.png");
      expect(img).toHaveAttribute("alt", "User Profile");
    });
  });

  describe("shapes and styles", () => {
    it("renders circle avatar by default", () => {
      const { container } = render(<Avatar>U</Avatar>);
      const avatarSpan = container.querySelector(".ant-avatar");

      expect(avatarSpan).toHaveClass("ant-avatar-circle");
    });

    it("renders square avatar when shape='square'", () => {
      const { container } = render(<Avatar shape="square">U</Avatar>);
      const avatarSpan = container.querySelector(".ant-avatar");

      expect(avatarSpan).toHaveClass("ant-avatar-square");
    });

    it("applies custom className and custom style", () => {
      const { container } = render(
        <Avatar className="my-avatar" style={{ backgroundColor: "#f56a00" }}>
          K
        </Avatar>,
      );
      const avatarSpan = container.querySelector(".ant-avatar");

      expect(avatarSpan).toHaveClass("custom-avatar");
      expect(avatarSpan).toHaveClass("my-avatar");
    });
  });

  describe("sizes", () => {
    it("renders with size presets", () => {
      const { container: smallContainer } = render(
        <Avatar size="small">S</Avatar>,
      );
      expect(
        smallContainer.querySelector(".ant-avatar-sm"),
      ).toBeInTheDocument();

      const { container: largeContainer } = render(
        <Avatar size="large">L</Avatar>,
      );
      expect(
        largeContainer.querySelector(".ant-avatar-lg"),
      ).toBeInTheDocument();
    });

    it("renders with custom numeric size", () => {
      const { container } = render(<Avatar size={64}>N</Avatar>);
      const avatarSpan = container.querySelector(".ant-avatar");

      expect(avatarSpan).toHaveStyle({
        width: "64px",
        height: "64px",
      });
    });
  });

  describe("events", () => {
    it("triggers onClick when avatar is clicked", () => {
      const handleClick = vi.fn();
      render(<Avatar onClick={handleClick}>Click</Avatar>);

      fireEvent.click(screen.getByText("Click"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("ref", () => {
    it("forwards ref to the underlying span element", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Avatar ref={ref}>Ref</Avatar>);

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe("Avatar.Group", () => {
    it("renders multiple avatars in a group", () => {
      render(
        <Avatar.Group>
          <Avatar>A</Avatar>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
        </Avatar.Group>,
      );

      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
    });

    it("limits avatar count using max prop", () => {
      render(
        <Avatar.Group max={{ count: 2 }}>
          <Avatar>User 1</Avatar>
          <Avatar>User 2</Avatar>
          <Avatar>User 3</Avatar>
        </Avatar.Group>,
      );

      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.getByText("User 2")).toBeInTheDocument();
      expect(screen.getByText("+1")).toBeInTheDocument();
    });
  });
});
