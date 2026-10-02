import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Message, message, useMessage } from "@/components/ui/Message";

describe("Message", () => {
  describe("static methods definition", () => {
    it("exposes all message utility methods", () => {
      expect(typeof message.success).toBe("function");
      expect(typeof message.error).toBe("function");
      expect(typeof message.info).toBe("function");
      expect(typeof message.warning).toBe("function");
      expect(typeof message.loading).toBe("function");
      expect(typeof message.open).toBe("function");
      expect(typeof message.destroy).toBe("function");
      expect(typeof message.config).toBe("function");
      expect(typeof message.useMessage).toBe("function");
    });

    it("Message alias points to the same object", () => {
      expect(Message).toBe(message);
    });
  });

  describe("toast triggers", () => {
    it("triggers success message", () => {
      expect(() => {
        message.success("Operation completed successfully");
      }).not.toThrow();
    });

    it("triggers error message", () => {
      expect(() => {
        message.error("Failed to execute request");
      }).not.toThrow();
    });

    it("triggers info message", () => {
      expect(() => {
        message.info("Here is some helpful information");
      }).not.toThrow();
    });

    it("triggers warning message", () => {
      expect(() => {
        message.warning("Please be cautious");
      }).not.toThrow();
    });

    it("triggers loading message", () => {
      expect(() => {
        message.loading("Loading data...");
      }).not.toThrow();
    });

    it("triggers custom open message and destroys", () => {
      expect(() => {
        message.open({
          content: "Custom toast",
          key: "custom-toast-key",
          duration: 2,
        });
        message.destroy("custom-toast-key");
      }).not.toThrow();
    });
  });

  describe("useMessage hook", () => {
    const TestComponent: React.FC = () => {
      const [messageApi, contextHolder] = useMessage();

      return (
        <div>
          {contextHolder}
          <button
            type="button"
            onClick={() => messageApi.success("Hook success message")}
          >
            Show Hook Message
          </button>
        </div>
      );
    };

    it("renders context holder and triggers message through hook", async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      const button = screen.getByRole("button", { name: "Show Hook Message" });
      await user.click(button);

      expect(screen.getByText("Hook success message")).toBeInTheDocument();
    });
  });
});
