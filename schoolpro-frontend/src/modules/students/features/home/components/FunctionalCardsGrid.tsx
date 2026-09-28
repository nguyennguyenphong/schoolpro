import React from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { FunctionalCardItem } from "@/modules/students/features/home/components/FunctionalCardItem";
import type { FeatureItem } from "@/modules/students/features/home/types";

interface FunctionalCardsGridProps {
  features?: FeatureItem[];
  onFeatureClick?: (feature: FeatureItem) => void;
}

export const FunctionalCardsGrid: React.FC<FunctionalCardsGridProps> = ({
  features = [],
  onFeatureClick,
}) => {
  const { t } = useTranslation(["student"]);

  const handleClick = (item: FeatureItem) => {
    if (onFeatureClick) {
      onFeatureClick(item);
    } else {
      const title = (t as (key: string) => string)(`student:features.${item.translationKey}.title`);
      message.info(`${title}`);
    }
  };

  return (
    <section aria-labelledby="functional-cards-title" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h2 id="functional-cards-title" className="text-base sm:text-lg font-bold text-slate-900 mb-0">
            {t("student:home.quickActions", { defaultValue: "Chức năng hệ thống" })}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item) => (
          <FunctionalCardItem
            key={item.id}
            item={item}
            onClick={() => handleClick(item)}
          />
        ))}
      </div>
    </section>
  );
};
