import React from "react";
import { ConfigProvider } from "antd";
import { AppRouter } from "@/app/routers/AppRouter";
import { useLanguage } from "@/i18n";

export const AppProvider: React.FC = () => {
  const { antdLocale, dir } = useLanguage();

  return (
    <ConfigProvider
      locale={antdLocale}
      direction={dir}
      theme={{
        token: {
          colorPrimary: "#2563eb",
          borderRadius: 8,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        },
        components: {
          Checkbox: {
            borderRadiusSM: 3,
          },
          Dropdown: {
            borderRadiusLG: 6,
          },
          Modal: {
            borderRadiusLG: 8,
          },
        },
      }}
    >
      <AppRouter />
    </ConfigProvider>
  );
};
