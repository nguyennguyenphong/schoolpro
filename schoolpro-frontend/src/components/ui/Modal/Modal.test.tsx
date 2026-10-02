import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "@/components/ui/Modal/Modal";
import { MODAL_SIZES } from "@/components/ui/Modal/constants";

describe("Modal", () => {
  describe("rendering", () => {
    it("renders modal when open is true", () => {
      render(
        <Modal open title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal content")).toBeInTheDocument();
    });

    it("does not render modal content when open is false", () => {
      render(
        <Modal open={false} title="Hidden Modal">
          <p>Hidden content</p>
        </Modal>,
      );

      expect(screen.queryByText("Hidden Modal")).not.toBeInTheDocument();
      expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
    });
  });

  describe("actions", () => {
    it("calls onOk when ok button is clicked", () => {
      const handleOk = vi.fn();

      render(
        <Modal open onOk={handleOk} okText="Confirm Action">
          <p>Content</p>
        </Modal>,
      );

      const okButton = screen.getByRole("button", { name: "Confirm Action" });
      fireEvent.click(okButton);

      expect(handleOk).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when cancel button is clicked", () => {
      const handleCancel = vi.fn();

      render(
        <Modal open onCancel={handleCancel} cancelText="Dismiss">
          <p>Content</p>
        </Modal>,
      );

      const cancelButton = screen.getByRole("button", { name: "Dismiss" });
      fireEvent.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("sizes", () => {
    it("applies width according to size preset", () => {
      const { container } = render(
        <Modal open size="lg" title="Large Modal">
          <p>Content</p>
        </Modal>,
      );

      const modalElement = container.ownerDocument.querySelector(".ant-modal");
      expect(modalElement).toHaveStyle({ width: `${MODAL_SIZES.lg}px` });
    });

    it("allows custom width to override size preset", () => {
      const { container } = render(
        <Modal open size="sm" width={650} title="Custom Width">
          <p>Content</p>
        </Modal>,
      );

      const modalElement = container.ownerDocument.querySelector(".ant-modal");
      expect(modalElement).toHaveStyle({ width: "650px" });
    });
  });

  describe("static methods", () => {
    it("exposes all Ant Design static methods", () => {
      expect(typeof Modal.confirm).toBe("function");
      expect(typeof Modal.info).toBe("function");
      expect(typeof Modal.success).toBe("function");
      expect(typeof Modal.error).toBe("function");
      expect(typeof Modal.warning).toBe("function");
      expect(typeof Modal.destroyAll).toBe("function");
      expect(typeof Modal.config).toBe("function");
      expect(typeof Modal.useModal).toBe("function");
    });
  });
});
