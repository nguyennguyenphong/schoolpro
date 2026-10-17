import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Skeleton,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonInput,
} from "@/components/ui/Skeleton/Skeleton";

describe("Skeleton", () => {
  it("renders skeleton lines", () => {
    const { container } = render(<Skeleton active />);
    expect(container.querySelector(".ant-skeleton")).toBeInTheDocument();
  });

  it("renders skeleton subcomponents", () => {
    const { container } = render(
      <div>
        <SkeletonButton />
        <SkeletonAvatar />
        <SkeletonInput />
      </div>,
    );

    expect(container.querySelector(".ant-skeleton-button")).toBeInTheDocument();
    expect(container.querySelector(".ant-skeleton-avatar")).toBeInTheDocument();
    expect(container.querySelector(".ant-skeleton-input")).toBeInTheDocument();
  });
});
