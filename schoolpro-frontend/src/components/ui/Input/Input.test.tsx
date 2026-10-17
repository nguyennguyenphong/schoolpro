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
  Input,
  Password,
  Search,
  TextArea,
  OTP,
} from "@/components/ui/Input/Input";

describe("Input", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      render(
        <Input
          placeholder="Username"
        />,
      );

      expect(
        screen.getByPlaceholderText("Username"),
      ).toBeInTheDocument();
    });

    it("renders default value", () => {
      render(
        <Input
          defaultValue="John"
        />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toHaveValue("John");
    });

    it("renders placeholder", () => {
      render(
        <Input
          placeholder="Enter username"
        />,
      );

      expect(
        screen.getByPlaceholderText(
          "Enter username",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("calls onChange when value changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Input
          onChange={handleChange}
        />,
      );

      const input =
        screen.getByRole("textbox");

      await user.type(
        input,
        "hello",
      );

      expect(
        handleChange,
      ).toHaveBeenCalled();

      expect(
        input,
      ).toHaveValue("hello");
    });

    it("supports controlled value", () => {
      const { rerender } = render(
        <Input value="John" />,
      );

      const input =
        screen.getByRole("textbox");

      expect(input).toHaveValue(
        "John",
      );

      rerender(
        <Input value="Jane" />,
      );

      expect(input).toHaveValue(
        "Jane",
      );
    });
  });

  describe("disabled state", () => {
    it("supports disabled state", () => {
      render(
        <Input disabled />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toBeDisabled();
    });

    it("does not accept input when disabled", async () => {
      const user = userEvent.setup();

      render(
        <Input disabled />,
      );

      const input =
        screen.getByRole("textbox");

      await user.type(
        input,
        "hello",
      );

      expect(input).toHaveValue("");
    });
  });

  describe("readonly state", () => {
    it("supports readOnly", () => {
      render(
        <Input
          readOnly
          value="Read only"
        />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toHaveAttribute(
        "readonly",
      );
    });
  });

  describe("validation status", () => {
    it("supports error status", () => {
      render(
        <Input
          status="error"
          placeholder="Username"
        />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toBeInTheDocument();
    });

    it("supports warning status", () => {
      render(
        <Input
          status="warning"
          placeholder="Username"
        />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toBeInTheDocument();
    });
  });

  describe("maxLength", () => {
    it("supports maxLength", () => {
      render(
        <Input maxLength={10} />,
      );

      expect(
        screen.getByRole("textbox"),
      ).toHaveAttribute(
        "maxlength",
        "10",
      );
    });
  });
});

describe("Password", () => {
  it("renders password input", () => {
    render(
      <Password
        placeholder="Password"
      />,
    );

    expect(
      screen.getByPlaceholderText(
        "Password",
      ),
    ).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("can toggle password visibility", async () => {
    const user = userEvent.setup();

    render(
      <Password
        defaultValue="secret"
      />,
    );

    const input =
      screen.getByDisplayValue(
        "secret",
      );

    expect(input).toHaveAttribute(
      "type",
      "password",
    );

    const toggleButton =
      screen.getByRole("button");

    await user.click(toggleButton);

    expect(input).toHaveAttribute(
      "type",
      "text",
    );
  });
});

describe("Search", () => {
  it("renders search input", () => {
    render(
      <Search
        placeholder="Search"
      />,
    );

    expect(
      screen.getByPlaceholderText(
        "Search",
      ),
    ).toBeInTheDocument();
  });

  it("calls onSearch", async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(
      <Search
        onSearch={handleSearch}
      />,
    );

    const input =
      screen.getByRole("searchbox");

    await user.type(
      input,
      "react",
    );

    await user.keyboard("{Enter}");

    expect(handleSearch).toHaveBeenCalled();
    expect(handleSearch.mock.calls[0][0]).toBe("react");
  });
});

describe("TextArea", () => {
  it("renders textarea", () => {
    render(
      <TextArea
        placeholder="Description"
      />,
    );

    expect(
      screen.getByRole("textbox"),
    ).toBeInTheDocument();
  });

  it("supports maxLength", () => {
    render(
      <TextArea
        maxLength={500}
      />,
    );

    expect(
      screen.getByRole("textbox"),
    ).toHaveAttribute(
      "maxlength",
      "500",
    );
  });
});

describe("OTP", () => {
  it("renders OTP inputs", () => {
    render(
      <OTP length={6} />,
    );

    expect(
      screen.getAllByRole("textbox"),
    ).toHaveLength(6);
  });
});
