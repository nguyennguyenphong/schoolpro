import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(<Button>Submit</Button>);

      expect(
        screen.getByRole("button", {
          name: "Submit",
        }),
      ).toBeInTheDocument();
    });

    it("renders with custom children", () => {
      render(<Button>Save changes</Button>);

      expect(
        screen.getByRole("button", {
          name: "Save changes",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders primary variant by default", () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole("button", {
        name: "Primary",
      });

      expect(button).toHaveClass("ant-btn-primary");
    });

    it("renders secondary variant", () => {
      render(
        <Button variant="secondary">
          Secondary
        </Button>,
      );

      const button = screen.getByRole("button", {
        name: "Secondary",
      });

      expect(button).toHaveClass("ant-btn-default");
    });

    it("renders outline variant", () => {
      render(
        <Button variant="outline">
          Outline
        </Button>,
      );

      const button = screen.getByRole("button", {
        name: "Outline",
      });

      expect(button).toHaveClass("ant-btn-default");
    });

    it("renders ghost variant", () => {
      render(
        <Button variant="ghost">
          Ghost
        </Button>,
      );

      const button = screen.getByRole("button", {
        name: "Ghost",
      });

      expect(button).toHaveClass("ant-btn-text");
    });

    it("renders danger variant", () => {
      render(
        <Button variant="danger">
          Delete
        </Button>,
      );

      const button = screen.getByRole("button", {
        name: "Delete",
      });

      expect(button).toHaveClass("ant-btn-primary");
      expect(button).toHaveClass("ant-btn-dangerous");
    });

    it("renders link variant", () => {
      render(
        <Button variant="link">
          View details
        </Button>,
      );

      const button = screen.getByRole("button", {
        name: "View details",
      });

      expect(button).toHaveClass("ant-btn-link");
    });
  });

  describe("states", () => {
    it("supports disabled state", () => {
      render(
        <Button disabled>
          Submit
        </Button>,
      );

      expect(
        screen.getByRole("button", {
          name: "Submit",
        }),
      ).toBeDisabled();
    });

    it("supports loading state", () => {
      render(
        <Button loading>
          Submit
        </Button>,
      );

      const button = screen.getByRole("button", {
        name: "Submit",
      });

      expect(button).toBeDisabled();
    });

    it("supports danger prop", () => {
      render(
        <Button danger>
          Delete
        </Button>,
      );

      expect(
        screen.getByRole("button", {
          name: "Delete",
        }),
      ).toHaveClass("ant-btn-dangerous");
    });
  });

  describe("size", () => {
    it("uses middle size by default", () => {
      render(<Button>Submit</Button>);

      expect(
        screen.getByRole("button", {
          name: "Submit",
        }),
      ).toHaveClass("ant-btn-color-default");
    });

    it("supports small size", () => {
      render(
        <Button size="small">
          Small
        </Button>,
      );

      expect(
        screen.getByRole("button", {
          name: "Small",
        }),
      ).toHaveClass("ant-btn-sm");
    });

    it("supports large size", () => {
      render(
        <Button size="large">
          Large
        </Button>,
      );

      expect(
        screen.getByRole("button", {
          name: "Large",
        }),
      ).toHaveClass("ant-btn-lg");
    });
  });

  describe("full width", () => {
    it("supports full width", () => {
      render(
        <Button fullWidth>
          Submit
        </Button>,
      );

      expect(
        screen.getByRole("button", {
          name: "Submit",
        }),
      ).toHaveStyle({
        width: "100%",
      });
    });

    it("allows custom style to override full width", () => {
      render(
        <Button
          fullWidth
          style={{ width: 300 }}
        >
          Submit
        </Button>,
      );

      expect(
        screen.getByRole("button", {
          name: "Submit",
        }),
      ).toHaveStyle({
        width: "300px",
      });
    });
  });

  describe("events", () => {
    it("calls onClick when clicked", () => {
      const handleClick = vi.fn();

      render(
        <Button onClick={handleClick}>
          Submit
        </Button>,
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: "Submit",
        }),
      );

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", () => {
      const handleClick = vi.fn();

      render(
        <Button
          disabled
          onClick={handleClick}
        >
          Submit
        </Button>,
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: "Submit",
        }),
      );

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("native button props", () => {
    it("supports htmlType", () => {
      render(
        <Button htmlType="submit">
          Submit
        </Button>,
      );

      expect(
        screen.getByRole("button", {
          name: "Submit",
        }),
      ).toHaveAttribute("type", "submit");
    });

    it("supports aria attributes", () => {
      render(
        <Button aria-label="Submit form">
          Submit
        </Button>,
      );

      expect(
        screen.getByRole("button", {
          name: "Submit form",
        }),
      ).toBeInTheDocument();
    });

    it("supports data attributes", () => {
      render(
        <Button data-testid="submit-button">
          Submit
        </Button>,
      );

      expect(
        screen.getByTestId("submit-button"),
      ).toBeInTheDocument();
    });
  });

  describe("ref", () => {
    it("forwards ref to the underlying button", () => {
      const ref = {
          current: null,
      } as unknown as React.RefObject<HTMLButtonElement>;

      render(
        <Button ref={ref}>
          Submit
        </Button>,
      );

      expect(ref.current).toBeInstanceOf(
        HTMLButtonElement,
      );
    });
  });
});
