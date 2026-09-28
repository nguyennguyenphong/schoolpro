import { forwardRef } from "react";
import { Carousel as AntCarousel } from "antd";
import type { CarouselProps, CarouselRef } from "@/components/ui/Carousel/types";
import { carouselStyles } from "@/components/ui/Carousel/styles";

export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  ({ style, ...props }, ref) => {
    return (
      <AntCarousel
        ref={ref}
        style={{
          ...carouselStyles,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Carousel.displayName = "Carousel";
