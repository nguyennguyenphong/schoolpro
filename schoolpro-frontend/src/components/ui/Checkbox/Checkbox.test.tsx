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

import { Checkbox } from "@/components/ui/Checkbox/Checkbox";

describe("Checkbox", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(
        <Checkbox>
          Remember me
        </Checkbox>,
      );

      expect(
        screen.getByRole("checkbox", {
          name: "Remember me",
        }),
      ).toBeInTheDocument();
    });

    it("renders unchecked by default", () => {
      render(
        <Checkbox>
          Remember me
        </Checkbox>,
      );

      expect(
        screen.getByRole("checkbox", {
          name: "Remember me",
        }),
      ).not.toBeChecked();
    });

    it("supports defaultChecked", () => {
      render(
        <Checkbox defaultChecked>
          Remember me
        </Checkbox>,
      );

      expect(
        screen.getByRole("checkbox", {
          name: "Remember me",
        }),
      ).toBeChecked();
    });
  });

  describe("interaction", () => {
    it("changes checked state when clicked", async () => {
      const user = userEvent.setup();

      render(
        <Checkbox>
          Remember me
        </Checkbox>,
      );

      const checkbox =
        screen.getByRole("checkbox", {
          name: "Remember me",
        });

      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      expect(checkbox).toBeChecked();

      await user.click(checkbox);

      expect(checkbox).not.toBeChecked();
    });

    it("calls onChange when checked state changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox
          onChange={handleChange}
        >
          Remember me
        </Checkbox>,
      );

      await user.click(
        screen.getByRole("checkbox", {
          name: "Remember me",
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
            checked: true,
          }),
        }),
      );
    });
  });

  describe("controlled state", () => {
    it("supports checked prop", () => {
      const { rerender } = render(
        <Checkbox checked={false}>
          Remember me
        </Checkbox>,
      );

      const checkbox =
        screen.getByRole("checkbox", {
          name: "Remember me",
        });

      expect(checkbox).not.toBeChecked();

      rerender(
        <Checkbox checked>
          Remember me
        </Checkbox>,
      );

      expect(checkbox).toBeChecked();
    });
  });

  describe("disabled state", () => {
    it("supports disabled state", () => {
      render(
        <Checkbox disabled>
          Remember me
        </Checkbox>,
      );

      expect(
        screen.getByRole("checkbox", {
          name: "Remember me",
        }),
      ).toBeDisabled();
    });

    it("does not change state when disabled", () => {
      render(
        <Checkbox disabled>
          Remember me
        </Checkbox>,
      );

      const checkbox =
        screen.getByRole("checkbox", {
          name: "Remember me",
        });

      fireEvent.click(checkbox);

      expect(checkbox).not.toBeChecked();
    });
  });

  describe("indeterminate state", () => {
    it("supports indeterminate state", () => {
      render(
        <Checkbox indeterminate>
          Select all
        </Checkbox>,
      );

      const checkbox =
        screen.getByRole("checkbox", {
          name: "Select all",
        });

      expect(checkbox).toHaveProperty(
        "indeterminate",
        true,
      );
    });
  });

  describe("accessibility", () => {
    it("supports aria attributes", () => {
      render(
        <Checkbox
          aria-label="Accept terms"
        >
          Accept
        </Checkbox>,
      );

      expect(
        screen.getByRole("checkbox", {
          name: "Accept terms",
        }),
      ).toBeInTheDocument();
    });

    it("supports aria-describedby", () => {
      render(
        <>
          <Checkbox
            aria-describedby="terms-description"
          >
            Accept terms
          </Checkbox>

          <span id="terms-description">
            You agree to the terms.
          </span>
        </>,
      );

      expect(
        screen.getByRole("checkbox", {
          name: "Accept terms",
        }),
      ).toHaveAttribute(
        "aria-describedby",
        "terms-description",
      );
    });
  });

  describe("group", () => {
    it("renders checkbox group", () => {
      render(
        <Checkbox.Group
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
        screen.getByRole("checkbox", {
          name: "Apple",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("checkbox", {
          name: "Orange",
        }),
      ).toBeInTheDocument();
    });

    it("supports group defaultValue", () => {
      render(
        <Checkbox.Group
          defaultValue={["apple"]}
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
        screen.getByRole("checkbox", {
          name: "Apple",
        }),
      ).toBeChecked();

      expect(
        screen.getByRole("checkbox", {
          name: "Orange",
        }),
      ).not.toBeChecked();
    });
  });
});
