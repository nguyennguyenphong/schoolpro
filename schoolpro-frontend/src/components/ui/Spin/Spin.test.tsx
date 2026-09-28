import {
  render,
  screen,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Spin,
} from "@/components/ui/Spin/Spin";

describe("Spin", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(
        <Spin />,
      );

      expect(
        screen.getByRole("status"),
      ).toBeInTheDocument();
    });

    it("renders loading indicator", () => {
      render(
        <Spin />,
      );

      expect(
        screen.getByRole("status"),
      ).toBeInTheDocument();
    });
  });

  describe("spinning state", () => {
    it("is spinning by default", () => {
      render(
        <Spin />,
      );

      expect(
        screen.getByRole("status"),
      ).toBeInTheDocument();
    });

    it("supports spinning prop", () => {
      const { rerender } =
        render(
          <Spin spinning />,
        );

      expect(
        screen.getByRole("status"),
      ).toBeInTheDocument();

      rerender(
        <Spin spinning={false} />,
      );

      expect(
        screen.queryByRole("status"),
      ).not.toBeInTheDocument();
    });
  });

  describe("tip", () => {
    it("renders loading tip", () => {
      render(
        <Spin tip="Loading..." />,
      );

      expect(
        screen.getByText("Loading..."),
      ).toBeInTheDocument();
    });

    it("renders custom tip", () => {
      render(
        <Spin tip="Fetching users..." />,
      );

      expect(
        screen.getByText(
          "Fetching users...",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("nested content", () => {
    it("renders children", () => {
      render(
        <Spin>
          <div>
            User content
          </div>
        </Spin>,
      );

      expect(
        screen.getByText(
          "User content",
        ),
      ).toBeInTheDocument();
    });

    it("keeps children rendered while spinning", () => {
      render(
        <Spin spinning>
          <div>
            User content
          </div>
        </Spin>,
      );

      expect(
        screen.getByText(
          "User content",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("status"),
      ).toBeInTheDocument();
    });

    it("renders children when not spinning", () => {
      render(
        <Spin spinning={false}>
          <div>
            User content
          </div>
        </Spin>,
      );

      expect(
        screen.getByText(
          "User content",
        ),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("status"),
      ).not.toBeInTheDocument();
    });
  });

  describe("size", () => {
    it("supports small size", () => {
      const { container } =
        render(
          <Spin size="small" />,
        );

      expect(
        container.firstChild,
      ).toBeInTheDocument();
    });

    it("supports default size", () => {
      const { container } =
        render(
          <Spin size="default" />,
        );

      expect(
        container.firstChild,
      ).toBeInTheDocument();
    });

    it("supports large size", () => {
      const { container } =
        render(
          <Spin size="large" />,
        );

      expect(
        container.firstChild,
      ).toBeInTheDocument();
    });
  });

  describe("delay", () => {
    it("accepts delay prop", () => {
      render(
        <Spin delay={300} />,
      );

      expect(
        screen.getByRole("status"),
      ).toBeInTheDocument();
    });
  });
});
