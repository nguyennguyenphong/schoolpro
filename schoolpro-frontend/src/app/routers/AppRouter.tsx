import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";
import { Spin } from "@/components/ui/Spin";
import { ProtectedRoute } from "@/app/routers/ProtectedRoute";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { getRoleHomeRoute } from "@/shared/utils/roleRoutes";
import { StudentRoutes } from "@/modules/students/routers";
import {
  AdminHomePage,
  ParentHomePage,
  StaffHomePage,
  SupervisorHomePage,
  TeacherHomePage,
} from "@/pages/RoleHome/RolePages";

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

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleHomeRoute(role)} replace />;
};

const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation("common");
  const { role, logout } = useAuthStore();

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Result
        status="403"
        title={t("errors.403.title")}
        subTitle={t("errors.403.subtitle")}
        extra={[
          <Button
            key="home"
            type="primary"
            href={getRoleHomeRoute(role)}
            className="mr-3"
          >
            Về trang chủ của bạn
          </Button>,
          <Button key="logout" onClick={() => logout()} href="/login">
            {t("buttons.backToLogin")}
          </Button>,
        ]}
      />
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Root dynamic dispatch */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Student Domain Routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            {StudentRoutes}
          </Route>

          {/* Protected Teacher Workspace Routes */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route path="/teacher/home" element={<TeacherHomePage />} />
            <Route path="/teacher" element={<Navigate to="/teacher/home" replace />} />
          </Route>

          {/* Protected Staff Workspace Routes */}
          <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
            <Route path="/staff/home" element={<StaffHomePage />} />
            <Route path="/staff" element={<Navigate to="/staff/home" replace />} />
          </Route>

          {/* Protected Admin & Principal Workspace Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "principal"]} />}>
            <Route path="/admin/dashboard" element={<AdminHomePage />} />
            <Route path="/admin/home" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Protected Parent Workspace Routes */}
          <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
            <Route path="/parent/home" element={<ParentHomePage />} />
            <Route path="/parent" element={<Navigate to="/parent/home" replace />} />
          </Route>

          {/* Protected Supervisor Workspace Routes */}
          <Route element={<ProtectedRoute allowedRoles={["supervisor"]} />}>
            <Route path="/supervisor/home" element={<SupervisorHomePage />} />
            <Route path="/supervisor" element={<Navigate to="/supervisor/home" replace />} />
          </Route>

          {/* Access Control & Fallback routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
