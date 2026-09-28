import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useLanguage } from "../hooks/useLanguage";
import type { SupportedLanguage } from "../config";

export interface LanguageSwitcherProps extends Omit<SelectProps, "value" | "onChange" | "options"> {
  showFlagOnly?: boolean;
  className?: string;
  width?: number | string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  showFlagOnly = false,
  className = "",
  width = 140,
  style,
  ...restProps
}) => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  const options = languages.map((item) => ({
    value: item.code,
    label: (
      <div className="flex items-center gap-2">
        <img
          src={item.flag}
          alt={item.name}
          className="w-5 h-3.5 object-cover rounded-xs shadow-xs shrink-0"
        />
        {!showFlagOnly && (
          <span className="text-sm font-medium text-slate-700">
            {item.nativeName}
          </span>
        )}
      </div>
    ),
  }));

  return (
    <Select
      aria-label="Language selector"
      value={currentLanguage}
      onChange={(val) => changeLanguage(val as SupportedLanguage)}
      options={options}
      style={{ width: showFlagOnly ? 70 : width, ...style }}
      className={`language-switcher ${className}`}
      popupMatchSelectWidth={false}
      {...restProps}
    />
  );
};
