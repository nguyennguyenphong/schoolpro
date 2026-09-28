import userEvent from "@testing-library/user-event";
import {
  render,
  screen,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Tabs } from "@/components/ui/Tabs/Tabs";

const items = [
  {
    key: "profile",
    label: "Profile",
    children: "Profile content",
  },
  {
    key: "security",
    label: "Security",
    children: "Security content",
  },
];

describe("Tabs", () => {
  describe("rendering", () => {
    it("renders tabs correctly", () => {
      render(
        <Tabs items={items} />,
      );

      expect(
        screen.getByRole("tab", {
          name: "Profile",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("tab", {
          name: "Security",
        }),
      ).toBeInTheDocument();
    });

    it("renders active tab content", () => {
      render(
        <Tabs items={items} />,
      );

      expect(
        screen.getByText("Profile content"),
      ).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("changes active tab when clicked", async () => {
      const user = userEvent.setup();

      render(
        <Tabs items={items} />,
      );

      await user.click(
        screen.getByRole("tab", {
          name: "Security",
        }),
      );

      expect(
        screen.getByText("Security content"),
      ).toBeInTheDocument();
    });

    it("calls onChange when active tab changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Tabs
          items={items}
          onChange={handleChange}
        />,
      );

      await user.click(
        screen.getByRole("tab", {
          name: "Security",
        }),
      );

      expect(handleChange).toHaveBeenCalledTimes(1);

      expect(handleChange).toHaveBeenCalledWith(
        "security",
      );
    });
  });

  describe("default active key", () => {
    it("supports defaultActiveKey", () => {
      render(
        <Tabs
          defaultActiveKey="security"
          items={items}
        />,
      );

      expect(
        screen.getByText("Security content"),
      ).toBeInTheDocument();
    });
  });

  describe("controlled state", () => {
    it("supports activeKey", () => {
      render(
        <Tabs
          activeKey="security"
          items={items}
        />,
      );

      expect(
        screen.getByText("Security content"),
      ).toBeInTheDocument();
    });
  });

  describe("disabled tabs", () => {
    it("does not activate a disabled tab", async () => {
      const user = userEvent.setup();

      render(
        <Tabs
          items={[
            {
              key: "profile",
              label: "Profile",
              children: "Profile content",
            },
            {
              key: "security",
              label: "Security",
              disabled: true,
              children: "Security content",
            },
          ]}
        />,
      );

      const securityTab =
        screen.getByRole("tab", {
          name: "Security",
        });

      expect(
        securityTab,
      ).toHaveAttribute(
        "aria-disabled",
        "true",
      );

      await user.click(securityTab);

      expect(
        screen.getByText("Profile content"),
      ).toBeInTheDocument();
    });
  });

  describe("tab click", () => {
    it("calls onTabClick", async () => {
      const user = userEvent.setup();
      const handleTabClick = vi.fn();

      render(
        <Tabs
          items={items}
          onTabClick={handleTabClick}
        />,
      );

      await user.click(
        screen.getByRole("tab", {
          name: "Security",
        }),
      );

      expect(
        handleTabClick,
      ).toHaveBeenCalledTimes(1);

      expect(
        handleTabClick,
      ).toHaveBeenCalledWith(
        "security",
        expect.anything(),
      );
    });
  });

  describe("accessibility", () => {
    it("renders tabs with tablist role", () => {
      render(
        <Tabs items={items} />,
      );

      expect(
        screen.getByRole("tablist"),
      ).toBeInTheDocument();
    });

    it("marks active tab correctly", () => {
      render(
        <Tabs items={items} />,
      );

      expect(
        screen.getByRole("tab", {
          name: "Profile",
        }),
      ).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });
});
