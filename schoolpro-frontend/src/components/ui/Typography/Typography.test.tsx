import {
  render,
  screen,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
} from "vitest";

import { Typography } from "@/components/ui/Typography/Typography";
import React from "react";

describe("Typography", () => {
  describe("rendering", () => {
    it("renders body text by default", () => {
      render(
        <Typography>
          Hello world
        </Typography>,
      );

      expect(
        screen.getByText("Hello world"),
      ).toBeInTheDocument();
    });

    it("renders heading level 1", () => {
      render(
        <Typography variant="h1">
          Page title
        </Typography>,
      );

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Page title",
        }),
      ).toBeInTheDocument();
    });

    it("renders heading level 2", () => {
      render(
        <Typography variant="h2">
          Section title
        </Typography>,
      );

      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Section title",
        }),
      ).toBeInTheDocument();
    });

    it("renders heading level 3", () => {
      render(
        <Typography variant="h3">
          Subsection
        </Typography>,
      );

      expect(
        screen.getByRole("heading", {
          level: 3,
          name: "Subsection",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders body variant", () => {
      render(
        <Typography variant="body">
          Body text
        </Typography>,
      );

      expect(
        screen.getByText("Body text"),
      ).toBeInTheDocument();
    });

    it("renders small body variant", () => {
      render(
        <Typography variant="body-sm">
          Small text
        </Typography>,
      );

      expect(
        screen.getByText("Small text"),
      ).toBeInTheDocument();
    });

    it("renders caption variant", () => {
      render(
        <Typography variant="caption">
          Caption
        </Typography>,
      );

      expect(
        screen.getByText("Caption"),
      ).toBeInTheDocument();
    });

    it("renders label variant", () => {
      render(
        <Typography variant="label">
          Email
        </Typography>,
      );

      expect(
        screen.getByText("Email"),
      ).toBeInTheDocument();
    });

    it("renders secondary variant", () => {
      render(
        <Typography variant="secondary">
          Secondary
        </Typography>,
      );

      expect(
        screen.getByText("Secondary"),
      ).toBeInTheDocument();
    });
  });

  describe("link", () => {
    it("renders link variant", () => {
      render(
        <Typography
          variant="link"
          href="/users"
        >
          Users
        </Typography>,
      );

      const link = screen.getByRole(
        "link",
        {
          name: "Users",
        },
      );

      expect(link).toHaveAttribute(
        "href",
        "/users",
      );
    });
  });

  describe("props", () => {
    it("supports strong text", () => {
      render(
        <Typography strong>
          Important
        </Typography>,
      );

      expect(
        screen.getByText("Important"),
      ).toBeInTheDocument();
    });

    it("supports disabled state", () => {
      render(
        <Typography disabled>
          Disabled
        </Typography>,
      );

      expect(
        screen.getByText("Disabled"),
      ).toBeInTheDocument();
    });

    it("supports custom className", () => {
      render(
        <Typography className="custom-text">
          Text
        </Typography>,
      );

      expect(
        screen.getByText("Text"),
      ).toHaveClass("custom-text");
    });

    it("supports custom data attributes", () => {
      render(
        <Typography data-testid="typography">
          Text
        </Typography>,
      );

      expect(
        screen.getByTestId("typography"),
      ).toBeInTheDocument();
    });
  });

  describe("weight", () => {
    it("supports custom font weight", () => {
      render(
        <Typography weight="semibold">
          Semibold
        </Typography>,
      );

      expect(
        screen.getByText("Semibold"),
      ).toHaveStyle({
        fontWeight: 600,
      });
    });

    it("supports bold weight", () => {
      render(
        <Typography weight="bold">
          Bold
        </Typography>,
      );

      expect(
        screen.getByText("Bold"),
      ).toHaveStyle({
        fontWeight: 700,
      });
    });
  });

  describe("ref", () => {
    it("forwards ref", () => {
      const ref =
        React.createRef<HTMLElement>();

      render(
        <Typography ref={ref}>
          Text
        </Typography>,
      );

      expect(ref.current).not.toBeNull();
    });
  });
});
