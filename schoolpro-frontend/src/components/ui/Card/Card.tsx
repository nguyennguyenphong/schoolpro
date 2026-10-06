import {
  Card as AntCard,
} from "antd";

import {
  Skeleton,
} from "@/components/ui/Skeleton";

import type {
  CardProps,
} from "@/components/ui/Card/types";

export const Card = ({
  loading = false,
  skeletonProps,
  children,
  ...props
}: CardProps) => {
  return (
    <AntCard {...props}>
      {loading ? (
        <Skeleton active {...skeletonProps} />
      ) : (
        children
      )}
    </AntCard>
  );
};

Card.displayName = "Card";

export const CardMeta = (
  props: React.ComponentProps<
    typeof AntCard.Meta
  >,
) => {
  return (
    <AntCard.Meta {...props} />
  );
};

CardMeta.displayName = "CardMeta";

export const CardGrid = (
  props: React.ComponentProps<
    typeof AntCard.Grid
  >,
) => {
  return (
    <AntCard.Grid {...props} />
  );
};

CardGrid.displayName = "CardGrid";
