import React from "react";
import type { MenuProps } from "antd";
import { useLanguage } from "@/i18n/hooks/useLanguage";
import type { SupportedLanguage } from "@/i18n/config";
import { Dropdown } from "@/components/ui/Dropdown";
import { Icon } from "@/components/ui/Icon";

export interface LanguageSwitcherProps {
  showFlagOnly?: boolean;
  className?: string;
  width?: number | string;
  style?: React.CSSProperties;
  placement?: "bottomLeft" | "bottomCenter" | "bottomRight" | "topLeft" | "topCenter" | "topRight";
  trigger?: ("click" | "hover" | "contextMenu")[];
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  showFlagOnly = false,
  className = "",
  width = 140,
  style,
  placement = "bottomRight",
  trigger = ["click"],
}) => {
  const { currentLanguage, currentMetadata, changeLanguage, languages } = useLanguage();

  const menuItems: MenuProps["items"] = languages.map((item) => ({
    key: item.code,
    label: (
      <div className="flex items-center gap-2.5 py-1 px-1">
        {item.flag ? (
          <img
            src={item.flag}
            alt={item.name}
            className="w-5 h-3.5 object-cover rounded-xs shadow-2xs shrink-0"
          />
        ) : null}
        <span className="text-xs font-medium text-slate-700">
          {item.nativeName}
        </span>
      </div>
    ),
  }));

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    changeLanguage(key as SupportedLanguage);
  };

  return (
    <Dropdown
      menu={{
        items: menuItems,
        selectedKeys: [currentLanguage],
        onClick: handleMenuClick,
      }}
      trigger={trigger}
      placement={placement}
      className={`language-switcher ${className}`}
    >
      <button
        type="button"
        aria-label="Language selector"
        style={{ width: showFlagOnly ? 70 : width, ...style }}
        className="h-8.75 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400"
      >
        <div className="flex items-center gap-2 min-w-0">
          {currentMetadata?.flag ? (
            <img
              src={currentMetadata.flag}
              alt={currentMetadata?.name || "flag"}
              className="w-5 h-3.5 object-cover rounded-xs shadow-2xs shrink-0"
            />
          ) : null}
          {!showFlagOnly && (
            <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
              {currentMetadata?.nativeName}
            </span>
          )}
        </div>
        <Icon
          name="chevron-down"
          size={13}
          className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0"
        />
      </button>
    </Dropdown>
  );
};
