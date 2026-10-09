import React from "react";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { getRoleHomeRoute } from "@/shared/utils/roleRoutes";

export const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation("common");
  const { role, logout, isAuthenticated } = useAuthStore();
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
    <div className="w-full bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
      <Result
        status="403"
        title={
          <span className="text-xl sm:text-2xl font-bold text-slate-800">
            {t("errors.403.title")}
          </span>
        }
        subTitle={
          <span className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl inline-block">
            {t("errors.403.subtitle")}
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
            key="back"
            icon={<Icon name="arrow-left" size={15} />}
            onClick={handleGoBack}
          >
            {t("actions.back")}
          </Button>,
          isAuthenticated && (
            <Button
              key="logout"
              type="text"
              danger
              icon={<Icon name="close" size={15} />}
              onClick={() => logout()}
            >
              {t("buttons.backToLogin")}
            </Button>
          ),
        ]}
      />
    </div>
  );
};
