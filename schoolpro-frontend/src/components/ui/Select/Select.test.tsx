import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "@/components/ui/Select";

describe("Select Component", () => {
  it("renders correctly with placeholder", () => {
    render(<Select placeholder="Select an option" />);
    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <Select className="custom-select-test" />,
    );
    expect(
      container.querySelector(".custom-select-test"),
    ).toBeInTheDocument();
  });

  it("supports disabled state", () => {
    const { container } = render(<Select disabled />);
    expect(
      container.querySelector(".ant-select-disabled"),
    ).toBeInTheDocument();
  });

  it("handles value selection", () => {
    const handleChange = vi.fn();
    const options = [
      { label: "Option 1", value: "opt1" },
      { label: "Option 2", value: "opt2" },
    ];

    render(
      <Select
        placeholder="Select option"
        options={options}
        onChange={handleChange}
      />,
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();
    fireEvent.mouseDown(combobox);

    const option = screen.getByTitle("Option 1");
    expect(option).toBeInTheDocument();
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith("opt1", expect.anything());
  });
});
