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

import dayjs from "dayjs";

import {
  DatePicker,
  RangePicker,
} from "@/components/ui/DatePicker/DatePicker";

describe("DatePicker", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(
        <DatePicker />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toBeInTheDocument();
    });

    it("renders placeholder", () => {
      render(
        <DatePicker
          placeholder="Select date"
        />,
      );

      expect(
        screen.getByPlaceholderText(
          "Select date",
        ),
      ).toBeInTheDocument();
    });

    it("supports default value", () => {
      render(
        <DatePicker
          defaultValue={dayjs(
            "2026-09-11",
          )}
        />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toHaveValue(
        "09/11/2026",
      );
    });
  });

  describe("controlled state", () => {
    it("supports value prop", () => {
      render(
        <DatePicker
          value={dayjs(
            "2026-09-11",
          )}
        />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toHaveValue(
        "09/11/2026",
      );
    });
  });

  describe("interaction", () => {
    it("opens picker when input is clicked", async () => {
      const user = userEvent.setup();

      render(
        <DatePicker />,
      );

      await user.click(
        screen.getByRole("textbox"),
      );

      expect(
        document.querySelector(
          ".ant-picker-dropdown",
        ),
      ).toBeInTheDocument();
    });

    it("calls onOpenChange", async () => {
      const user = userEvent.setup();
      const handleOpenChange =
        vi.fn();

      render(
        <DatePicker
          onOpenChange={
            handleOpenChange
          }
        />,
      );

      await user.click(
        screen.getByRole("textbox"),
      );

      expect(
        handleOpenChange,
      ).toHaveBeenCalledWith(
        true,
      );
    });
  });

  describe("disabled state", () => {
    it("supports disabled state", () => {
      render(
        <DatePicker disabled />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toBeDisabled();
    });
  });

  describe("onChange", () => {
    it("calls onChange when date changes", async () => {
      const user = userEvent.setup();
      const handleChange =
        vi.fn();

      render(
        <DatePicker
          open
          onChange={handleChange}
        />,
      );

      const dateCell =
        screen.getByText("15");

      await user.click(dateCell);

      expect(
        handleChange,
      ).toHaveBeenCalledTimes(1);
    });
  });
});

describe("RangePicker", () => {
  it("renders two inputs", () => {
    render(
      <RangePicker />,
    );

    expect(
      screen.getAllByRole("textbox"),
    ).toHaveLength(2);
  });

  it("supports placeholder", () => {
    render(
      <RangePicker
        placeholder={[
          "Start date",
          "End date",
        ]}
      />,
    );

    expect(
      screen.getByPlaceholderText(
        "Start date",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "End date",
      ),
    ).toBeInTheDocument();
  });

  it("supports disabled state", () => {
    render(
      <RangePicker disabled />,
    );

    const inputs =
      screen.getAllByRole("textbox");

    expect(inputs[0])
      .toBeDisabled();

    expect(inputs[1])
      .toBeDisabled();
  });
});
