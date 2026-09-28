import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";
import { Spin } from "@/components/ui/Spin";

const LoginPage = lazy(() =>
  import("@/pages/Login").then(({ LoginPage }) => ({ default: LoginPage }))
);

const ForgotPasswordPage = lazy(() =>
  import("@/pages/ForgotPassword").then(({ ForgotPasswordPage }) => ({
    default: ForgotPasswordPage,
  }))
);

const VerifyOtpPage = lazy(() =>
  import("@/pages/VerifyOtp").then(({ VerifyOtpPage }) => ({
    default: VerifyOtpPage,
  }))
);

const ResetPasswordPage = lazy(() =>
  import("@/pages/ResetPassword").then(({ ResetPasswordPage }) => ({
    default: ResetPasswordPage,
  }))
);

import { StudentRoutes } from "@/modules/students/routers";

const PageLoader: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white/80 backdrop-blur-sm fixed inset-0 z-50">
      <Spin
        size="large"
        description={
          <span className="text-[#1677FF] font-medium tracking-wide">
            {t("pageLoader.loadingText")}
          </span>
        }
        className="text-[#1677FF]"
      />
    </div>
  );
};

const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Result
        status="403"
        title={t("errors.403.title")}
        subTitle={t("errors.403.subtitle")}
        extra={
          <Button type="primary" href="/login">
            {t("buttons.backToLogin")}
          </Button>
        }
      />
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {StudentRoutes}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
