import React from "react";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { getRoleHomeRoute } from "@/shared/utils/roleRoutes";

export const BadRequestPage: React.FC = () => {
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

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-2xs p-8 sm:p-14">
      <Result
        status="warning"
        title={
          <span className="text-xl sm:text-2xl font-bold text-slate-800">
            {t("errors.400.title")}
          </span>
        }
        subTitle={
          <span className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl inline-block">
            {t("errors.400.subtitle")}
          </span>
        }
        extra={[
          <Button
            key="home"
            type="primary"
            icon={<Icon name={isAuthenticated ? "home" : "user"} size={15} />}
            onClick={handleGoHome}
          >
            {isAuthenticated ? t("buttons.goHome") : t("buttons.login")}
          </Button>,
          <Button
            key="reload"
            icon={<Icon name="refresh" size={15} />}
            onClick={handleReload}
          >
            {t("actions.reload")}
          </Button>,
          <Button
            key="back"
            icon={<Icon name="arrow-left" size={15} />}
            onClick={handleGoBack}
          >
            {t("actions.back")}
          </Button>,
        ]}
      />
    </div>
  );
};
