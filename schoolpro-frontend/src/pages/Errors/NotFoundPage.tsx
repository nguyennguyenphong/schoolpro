import React from "react";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { getRoleHomeRoute } from "@/shared/utils/roleRoutes";

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation("common");
  const { role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate(getRoleHomeRoute(role));
    } else {
      navigate("/login");
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-xl bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        <Result
          status="404"
          title={
            <span className="text-2xl font-bold text-slate-800">
              {t("errors.404.title")}
            </span>
          }
          subTitle={
            <span className="text-slate-500 text-sm sm:text-base leading-relaxed">
              {t("errors.404.subtitle")}
            </span>
          }
          extra={[
            <Button
              key="home"
              type="primary"
              size="large"
              onClick={handleGoHome}
              className="min-w-35"
            >
              {isAuthenticated ? t("buttons.goHome") : t("buttons.login")}
            </Button>,
            <Button
              key="back"
              size="large"
              onClick={handleGoBack}
              className="min-w-30"
            >
              {t("actions.back")}
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};
