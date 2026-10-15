import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuestionCard } from "@/modules/students/features/exams/components/test-form/QuestionCard";
import type { ExamQuestion } from "@/modules/students/features/exams/types";

describe("QuestionCard", () => {
  const radioQuestion: ExamQuestion = {
    id: "q-1",
    title: "Cấu trúc dữ liệu nào hoạt động theo LIFO?",
    description: "Chọn đáp án đúng nhất",
    type: "radio",
    required: true,
    points: 1.5,
    options: ["Queue", "Stack", "Tree"],
    correctAnswer: "Stack",
  };

  it("renders question title, points, and required indicator", () => {
    const onChange = vi.fn();
    render(
      <QuestionCard
        question={radioQuestion}
        index={0}
        value={undefined}
        onChange={onChange}
      />
    );

    expect(screen.getByText("Câu 1")).toBeInTheDocument();
    expect(screen.getByText("1.5 điểm")).toBeInTheDocument();
    expect(screen.getByText("* Bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Cấu trúc dữ liệu nào hoạt động theo LIFO?")).toBeInTheDocument();
    expect(screen.getByText("Stack")).toBeInTheDocument();
  });

  it("triggers onChange when selecting a radio option", () => {
    const onChange = vi.fn();
    render(
      <QuestionCard
        question={radioQuestion}
        index={0}
        value={undefined}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByText("Stack"));
    expect(onChange).toHaveBeenCalledWith("Stack");
  });

  it("renders boolean question type correctly", () => {
    const boolQuestion: ExamQuestion = {
      id: "q-bool",
      title: "WebSocket hoạt động 2 chiều?",
      type: "boolean",
      required: false,
      points: 2.0,
      correctAnswer: true,
    };
    const onChange = vi.fn();

    render(
      <QuestionCard
        question={boolQuestion}
        index={1}
        value={undefined}
        onChange={onChange}
      />
    );

    expect(screen.getByText("WebSocket hoạt động 2 chiều?")).toBeInTheDocument();
    expect(screen.getByText("Đúng (True)")).toBeInTheDocument();
    expect(screen.getByText("Sai (False)")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Đúng (True)"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders input question type correctly", () => {
    const inputQuestion: ExamQuestion = {
      id: "q-input",
      title: "Nhập mã trạng thái HTTP Unauthorized:",
      type: "input",
      required: true,
      points: 1.0,
      placeholder: "VD: 401",
      correctAnswer: "401",
    };
    const onChange = vi.fn();

    render(
      <QuestionCard
        question={inputQuestion}
        index={2}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText("VD: 401");
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "401" } });
    expect(onChange).toHaveBeenCalledWith("401");
  });
});
