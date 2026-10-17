import userEvent from "@testing-library/user-event";

import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  Radio,
  RadioGroup,
} from "@/components/ui/Radio/Radio";

describe("Radio", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(
        <Radio>
          Option A
        </Radio>,
      );

      expect(
        screen.getByRole("radio", {
          name: "Option A",
        }),
      ).toBeInTheDocument();
    });

    it("renders unchecked by default", () => {
      render(
        <Radio>
          Option A
        </Radio>,
      );

      expect(
        screen.getByRole("radio", {
          name: "Option A",
        }),
      ).not.toBeChecked();
    });

    it("supports defaultChecked", () => {
      render(
        <Radio defaultChecked>
          Option A
        </Radio>,
      );

      expect(
        screen.getByRole("radio", {
          name: "Option A",
        }),
      ).toBeChecked();
    });
  });

  describe("interaction", () => {
    it("changes checked state when clicked", async () => {
      const user = userEvent.setup();

      render(
        <Radio>
          Option A
        </Radio>,
      );

      const radio =
        screen.getByRole("radio", {
          name: "Option A",
        });

      expect(radio).not.toBeChecked();

      await user.click(radio);

      expect(radio).toBeChecked();
    });

    it("calls onChange", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Radio
          onChange={handleChange}
        >
          Option A
        </Radio>,
      );

      await user.click(
        screen.getByRole("radio", {
          name: "Option A",
        }),
      );

      expect(
        handleChange,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled state", () => {
    it("supports disabled state", () => {
      render(
        <Radio disabled>
          Option A
        </Radio>,
      );

      expect(
        screen.getByRole("radio", {
          name: "Option A",
        }),
      ).toBeDisabled();
    });

    it("does not change state when disabled", () => {
      render(
        <Radio disabled>
          Option A
        </Radio>,
      );

      const radio =
        screen.getByRole("radio", {
          name: "Option A",
        });

      fireEvent.click(radio);

      expect(radio).not.toBeChecked();
    });
  });
});

describe("RadioGroup", () => {
  describe("rendering", () => {
    it("renders options", () => {
      render(
        <RadioGroup
          options={[
            {
              label: "Apple",
              value: "apple",
            },
            {
              label: "Orange",
              value: "orange",
            },
          ]}
        />,
      );

      expect(
        screen.getByRole("radio", {
          name: "Apple",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("radio", {
          name: "Orange",
        }),
      ).toBeInTheDocument();
    });

    it("supports defaultValue", () => {
      render(
        <RadioGroup
          defaultValue="apple"
          options={[
            {
              label: "Apple",
              value: "apple",
            },
            {
              label: "Orange",
              value: "orange",
            },
          ]}
        />,
      );

      expect(
        screen.getByRole("radio", {
          name: "Apple",
        }),
      ).toBeChecked();

      expect(
        screen.getByRole("radio", {
          name: "Orange",
        }),
      ).not.toBeChecked();
    });
  });

  describe("interaction", () => {
    it("allows selecting one option", async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup
          defaultValue="apple"
          options={[
            {
              label: "Apple",
              value: "apple",
            },
            {
              label: "Orange",
              value: "orange",
            },
          ]}
        />,
      );

      const apple =
        screen.getByRole("radio", {
          name: "Apple",
        });

      const orange =
        screen.getByRole("radio", {
          name: "Orange",
        });

      expect(apple).toBeChecked();
      expect(orange).not.toBeChecked();

      await user.click(orange);

      expect(apple).not.toBeChecked();
      expect(orange).toBeChecked();
    });

    it("calls onChange with selected value", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup
          onChange={handleChange}
          options={[
            {
              label: "Apple",
              value: "apple",
            },
            {
              label: "Orange",
              value: "orange",
            },
          ]}
        />,
      );

      await user.click(
        screen.getByRole("radio", {
          name: "Orange",
        }),
      );

      expect(
        handleChange,
      ).toHaveBeenCalledTimes(1);

      expect(
        handleChange,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: "orange",
          }),
        }),
      );
    });
  });

  describe("disabled state", () => {
    it("supports disabled group", () => {
      render(
        <RadioGroup
          disabled
          options={[
            {
              label: "Apple",
              value: "apple",
            },
            {
              label: "Orange",
              value: "orange",
            },
          ]}
        />,
      );

      expect(
        screen.getByRole("radio", {
          name: "Apple",
        }),
      ).toBeDisabled();

      expect(
        screen.getByRole("radio", {
          name: "Orange",
        }),
      ).toBeDisabled();
    });

    it("supports disabled option", () => {
      render(
        <RadioGroup
          options={[
            {
              label: "Apple",
              value: "apple",
            },
            {
              label: "Orange",
              value: "orange",
              disabled: true,
            },
          ]}
        />,
      );

      expect(
        screen.getByRole("radio", {
          name: "Orange",
        }),
      ).toBeDisabled();
    });
  });

  describe("controlled state", () => {
    it("supports controlled value", () => {
      const { rerender } =
        render(
          <RadioGroup
            value="apple"
            options={[
              {
                label: "Apple",
                value: "apple",
              },
              {
                label: "Orange",
                value: "orange",
              },
            ]}
          />,
        );

      const apple =
        screen.getByRole("radio", {
          name: "Apple",
        });

      const orange =
        screen.getByRole("radio", {
          name: "Orange",
        });

      expect(apple).toBeChecked();
      expect(orange).not.toBeChecked();

      rerender(
        <RadioGroup
          value="orange"
          options={[
            {
              label: "Apple",
              value: "apple",
            },
            {
              label: "Orange",
              value: "orange",
            },
          ]}
        />,
      );

      expect(apple).not.toBeChecked();
      expect(orange).toBeChecked();
    });
  });

  describe("children", () => {
    it("renders radio children", () => {
      render(
        <RadioGroup>
          <Radio value="apple">
            Apple
          </Radio>

          <Radio value="orange">
            Orange
          </Radio>
        </RadioGroup>,
      );

      expect(
        screen.getByRole("radio", {
          name: "Apple",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("radio", {
          name: "Orange",
        }),
      ).toBeInTheDocument();
    });
  });
});
