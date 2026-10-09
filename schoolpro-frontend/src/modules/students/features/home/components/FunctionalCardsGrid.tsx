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
  const { t, i18n } = useTranslation(["card", "message"]);

  const handleClick = (item: FeatureItem) => {
    if (onFeatureClick) {
      onFeatureClick(item);
    } else if (!item.route) {
      const fallbackTitle = item.name || item.code || "";
      const transKey = item.translationKey ? `card:features.${item.translationKey}.title` : "";
      const title = transKey && i18n.exists(transKey) ? t(transKey as any) : fallbackTitle;
      message.info(`${title}`);
    }
  };

  return (
    <section aria-labelledby="functional-cards-title" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h2
            id="functional-cards-title"
            className="text-base sm:text-lg font-bold text-slate-900 mb-0"
          >
            {t("card:quickActionsTitle")}
          </h2>
        </div>
      </div>

      {features.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-[#f0f0f0] rounded-xl">
          <p className="text-sm text-slate-500 mb-0">
            {t("message:empty.noFeatures")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item) => (
            <FunctionalCardItem
              key={item.id}
              item={item}
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
