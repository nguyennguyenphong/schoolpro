import userEvent from "@testing-library/user-event";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Dropdown } from "@/components/ui/Dropdown/Dropdown";

const items = [
  {
    key: "edit",
    label: "Edit",
  },
  {
    key: "delete",
    label: "Delete",
  },
];

describe("Dropdown", () => {
  describe("rendering", () => {
    it("renders trigger correctly", () => {
      render(
        <Dropdown
          trigger={["click"]}
          menu={{ items }}
        >
          <button type="button">
            Actions
          </button>
        </Dropdown>,
      );

      expect(
        screen.getByRole("button", {
          name: "Actions",
        }),
      ).toBeInTheDocument();
    });

    it("does not render menu before opening", () => {
      render(
        <Dropdown
          trigger={["click"]}
          menu={{ items }}
        >
          <button type="button">
            Actions
          </button>
        </Dropdown>,
      );

      expect(
        screen.queryByRole("menu"),
      ).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("opens menu when trigger is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dropdown
          trigger={["click"]}
          menu={{ items }}
        >
          <button type="button">
            Actions
          </button>
        </Dropdown>,
      );

      await user.click(
        screen.getByRole("button", {
          name: "Actions",
        }),
      );

      expect(
        screen.getByRole("menu"),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("menuitem", {
          name: "Edit",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("menuitem", {
          name: "Delete",
        }),
      ).toBeInTheDocument();
    });

    it("closes menu when trigger is clicked again", async () => {
      const user = userEvent.setup();

      render(
        <Dropdown
          trigger={["click"]}
          menu={{ items }}
        >
          <button type="button">
            Actions
          </button>
        </Dropdown>,
      );

      const trigger = screen.getByRole(
        "button",
        {
          name: "Actions",
        },
      );

      await user.click(trigger);

      expect(
        screen.getByRole("menu"),
      ).toBeInTheDocument();

      await user.click(trigger);

      expect(
        document.querySelector(".ant-slide-up-leave") ||
          !screen.queryByRole("menu"),
      ).toBeTruthy();
    });
  });

  describe("menu events", () => {
    it("calls menu onClick when an item is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Dropdown
          trigger={["click"]}
          menu={{
            items,
            onClick: handleClick,
          }}
        >
          <button type="button">
            Actions
          </button>
        </Dropdown>,
      );

      await user.click(
        screen.getByRole("button", {
          name: "Actions",
        }),
      );

      await user.click(
        screen.getByRole("menuitem", {
          name: "Edit",
        }),
      );

      expect(handleClick).toHaveBeenCalledTimes(1);

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "edit",
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("does not open when disabled", async () => {
      const user = userEvent.setup();

      render(
        <Dropdown
          disabled
          trigger={["click"]}
          menu={{ items }}
        >
          <button type="button">
            Actions
          </button>
        </Dropdown>,
      );

      await user.click(
        screen.getByRole("button", {
          name: "Actions",
        }),
      );

      expect(
        screen.queryByRole("menu"),
      ).not.toBeInTheDocument();
    });
  });

  describe("open state", () => {
    it("calls onOpenChange when visibility changes", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Dropdown
          trigger={["click"]}
          menu={{ items }}
          onOpenChange={handleOpenChange}
        >
          <button type="button">
            Actions
          </button>
        </Dropdown>,
      );

      await user.click(
        screen.getByRole("button", {
          name: "Actions",
        }),
      );

      expect(
        handleOpenChange,
      ).toHaveBeenCalledWith(
        true,
        expect.anything(),
      );
    });
  });

  describe("controlled state", () => {
    it("supports controlled open state", async () => {
      render(
        <Dropdown
          open
          trigger={["click"]}
          menu={{ items }}
        >
          <button type="button">
            Actions
          </button>
        </Dropdown>,
      );

      await waitFor(() => {
        expect(
          screen.getByRole("menu"),
        ).toBeInTheDocument();
      });
    });
  });
});
