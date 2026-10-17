import React from "react";
import { Icon } from "@/components/ui/Icon";
import type { MaterialFormat } from "@/modules/students/features/materials/types";
import { MATERIAL_FORMAT_META } from "@/modules/students/features/materials/utils";

interface MaterialFormatBadgeProps {
  format: MaterialFormat;
  fileSize?: string;
  size?: "sm" | "md";
  separator?: string;
  className?: string;
}

export const MaterialFormatBadge: React.FC<MaterialFormatBadgeProps> = ({
  format,
  fileSize,
  size = "sm",
  separator = "|",
  className = "",
}) => {
  const meta = MATERIAL_FORMAT_META[format] || MATERIAL_FORMAT_META.archive;
  const isSm = size === "sm";

  return (
    <span
      className={`font-bold rounded border flex items-center shrink-0 ${
        isSm
          ? "text-[11px] px-2 py-0.5 gap-1"
          : "text-xs px-2.5 py-1 gap-1.5 rounded-md"
      } ${meta.badgeClass} ${className}`}
    >
      <Icon name={meta.icon} size={isSm ? 12 : 13} />
      <span>
        {meta.label}
        {fileSize ? ` ${separator} ${fileSize}` : ""}
      </span>
    </span>
  );
};
