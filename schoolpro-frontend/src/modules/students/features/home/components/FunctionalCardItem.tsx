import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { FeatureItem } from "@/modules/students/features/home/types";

interface FunctionalCardItemProps {
  item: FeatureItem;
  onClick?: () => void;
}

export const FunctionalCardItem: React.FC<FunctionalCardItemProps> = ({
  item,
  onClick,
}) => {
  const { t } = useTranslation(["student"]);

  const title = (t as (key: string) => string)(`student:features.${item.translationKey}.title`);
  const description = (t as (key: string) => string)(`student:features.${item.translationKey}.description`);
  const badgeText = (t as (key: string) => string)(`student:features.${item.translationKey}.badge`);

  return (
    <Card
      onClick={onClick}
      className="p-5 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group bg-white relative overflow-hidden rounded-xl shadow-2xs"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${item.iconBgColor} ${item.iconColor}`}
        >
          <Icon name={item.iconName} size={21} />
        </div>

        {Boolean(badgeText) && (
          <Tag
            color={item.badgeColor || "blue"}
            className="text-[11px] font-bold mr-0 px-2.5 py-0.5 rounded-full border border-current/20 shadow-2xs"
          >
            {badgeText}
          </Tag>
        )}
      </div>

      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 flex items-center justify-between">
        <span>{title}</span>
        <Icon
          name="arrow-right"
          size={14}
          className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100"
        />
      </h3>

      <p className="text-xs text-slate-500 mb-0 leading-relaxed line-clamp-2 font-normal">
        {description}
      </p>
    </Card>
  );
};
