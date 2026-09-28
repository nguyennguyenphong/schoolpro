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

import {
  Rate,
} from "@/components/ui/Rate/Rate";

describe("Rate", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(
        <Rate />,
      );

      expect(
        screen.getByRole("radiogroup"),
      ).toBeInTheDocument();
    });

    it("renders the default number of items", () => {
      const { container } = render(
        <Rate />,
      );

      expect(
        container.querySelectorAll(
          ".ant-rate-star",
        ),
      ).toHaveLength(5);
    });

    it("supports custom count", () => {
      const { container } = render(
        <Rate count={10} />,
      );

      expect(
        container.querySelectorAll(
          ".ant-rate-star",
        ),
      ).toHaveLength(10);
    });

    it("supports defaultValue", () => {
      render(
        <Rate defaultValue={3} />,
      );

      const checkedItems =
        screen.getAllByRole("radio", {
          checked: true,
        });

      expect(
        checkedItems,
      ).toHaveLength(3);
    });
  });

  describe("interaction", () => {
    it("calls onChange when rating changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Rate
          onChange={handleChange}
        />,
      );

      const radios =
        screen.getAllByRole("radio");

      await user.click(radios[2]);

      expect(
        handleChange,
      ).toHaveBeenCalledTimes(1);

      expect(
        handleChange,
      ).toHaveBeenCalledWith(3);
    });

    it("updates rating when uncontrolled", async () => {
      const user = userEvent.setup();

      render(
        <Rate />,
      );

      const radios =
        screen.getAllByRole("radio");

      await user.click(radios[3]);

      expect(
        screen.getAllByRole("radio", {
          checked: true,
        }),
      ).toHaveLength(4);
    });
  });

  describe("controlled state", () => {
    it("supports value prop", () => {
      const { rerender } = render(
        <Rate value={2} />,
      );

      expect(
        screen.getAllByRole("radio", {
          checked: true,
        }),
      ).toHaveLength(2);

      rerender(
        <Rate value={4} />,
      );

      expect(
        screen.getAllByRole("radio", {
          checked: true,
        }),
      ).toHaveLength(4);
    });
  });

  describe("disabled state", () => {
    it("supports disabled state", () => {
      render(
        <Rate
          value={3}
          disabled
        />,
      );

      const radios =
        screen.getAllByRole("radio");

      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it("does not change value when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Rate
          value={3}
          disabled
          onChange={handleChange}
        />,
      );

      const radios =
        screen.getAllByRole("radio");

      await user.click(radios[4]);

      expect(
        handleChange,
      ).not.toHaveBeenCalled();
    });
  });

  describe("allowClear", () => {
    it("clears the value when clicked again", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Rate
          defaultValue={3}
          onChange={handleChange}
        />,
      );

      const radios =
        screen.getAllByRole("radio");

      await user.click(radios[2]);

      expect(
        handleChange,
      ).toHaveBeenLastCalledWith(0);
    });

    it("does not clear when allowClear is false", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Rate
          defaultValue={3}
          allowClear={false}
          onChange={handleChange}
        />,
      );

      const radios =
        screen.getAllByRole("radio");

      await user.click(radios[2]);

      expect(
        handleChange,
      ).toHaveBeenLastCalledWith(3);
    });
  });

  describe("half rating", () => {
    it("supports allowHalf", () => {
      render(
        <Rate
          allowHalf
          value={3.5}
        />,
      );

      expect(
        screen.getByRole("radiogroup"),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("renders radio group", () => {
      render(
        <Rate
          aria-label="Product rating"
        />,
      );

      expect(
        screen.getByRole("radiogroup", {
          name: "Product rating",
        }),
      ).toBeInTheDocument();
    });
  });
});
