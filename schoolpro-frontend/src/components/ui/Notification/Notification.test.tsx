import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Notification,
  notification,
  useNotification,
} from "@/components/ui/Notification";

describe("Notification", () => {
  describe("static methods definition", () => {
    it("exposes all notification utility methods", () => {
      expect(typeof notification.success).toBe("function");
      expect(typeof notification.error).toBe("function");
      expect(typeof notification.info).toBe("function");
      expect(typeof notification.warning).toBe("function");
      expect(typeof notification.open).toBe("function");
      expect(typeof notification.destroy).toBe("function");
      expect(typeof notification.config).toBe("function");
      expect(typeof notification.useNotification).toBe("function");
    });

    it("Notification alias points to the same object", () => {
      expect(Notification).toBe(notification);
    });
  });

  describe("notification triggers", () => {
    it("triggers success notification", () => {
      expect(() => {
        notification.success({
          title: "Success Title",
          description: "Operation completed successfully",
        });
      }).not.toThrow();
    });

    it("triggers error notification", () => {
      expect(() => {
        notification.error({
          title: "Error Title",
          description: "Something went wrong",
        });
      }).not.toThrow();
    });

    it("triggers info notification", () => {
      expect(() => {
        notification.info({
          title: "Info Title",
          description: "System maintenance scheduled",
        });
      }).not.toThrow();
    });

    it("triggers warning notification", () => {
      expect(() => {
        notification.warning({
          title: "Warning Title",
          description: "Your session is about to expire",
        });
      }).not.toThrow();
    });

    it("triggers open notification and destroys by key", () => {
      expect(() => {
        notification.open({
          title: "Custom Notification",
          description: "Custom notification description",
          key: "test-notification-key",
        });
        notification.destroy("test-notification-key");
      }).not.toThrow();
    });
  });

  describe("useNotification hook", () => {
    const TestComponent: React.FC = () => {
      const [api, contextHolder] = useNotification();

      return (
        <div>
          {contextHolder}
          <button
            type="button"
            onClick={() =>
              api.success({
                title: "Hook Notification Title",
                description: "Hook notification description",
              })
            }
          >
            Show Hook Notification
          </button>
        </div>
      );
    };

    it("renders context holder and triggers notification through hook", async () => {
      const user = userEvent.setup();
      render(<TestComponent />);

      const button = screen.getByRole("button", {
        name: "Show Hook Notification",
      });
      await user.click(button);

      expect(
        screen.getByText("Hook Notification Title"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Hook notification description"),
      ).toBeInTheDocument();
    });
  });
});
