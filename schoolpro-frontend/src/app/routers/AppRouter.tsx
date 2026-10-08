import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spin } from "@/components/ui/Spin";
import { ProtectedRoute } from "@/app/routers/ProtectedRoute";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { getRoleHomeRoute } from "@/shared/utils/roleRoutes";
import { StudentRoutes } from "@/modules/students/routers";
import { MainLayout } from "@/layouts/MainLayout";
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

const ForbiddenPage = lazy(() =>
  import("@/pages/Errors").then(({ ForbiddenPage }) => ({
    default: ForbiddenPage,
  }))
);

const NotFoundPage = lazy(() =>
  import("@/pages/Errors").then(({ NotFoundPage }) => ({
    default: NotFoundPage,
  }))
);

const BadRequestPage = lazy(() =>
  import("@/pages/Errors").then(({ BadRequestPage }) => ({
    default: BadRequestPage,
  }))
);

const ServerErrorPage = lazy(() =>
  import("@/pages/Errors").then(({ ServerErrorPage }) => ({
    default: ServerErrorPage,
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

          {/* Access Control & Error Fallback routes (Inherit MainLayout) */}
          <Route element={<MainLayout />}>
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/unauthorized" element={<Navigate to="/403" replace />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/400" element={<BadRequestPage />} />
            <Route path="/500" element={<ServerErrorPage />} />

            {/* Catch-all unmatched paths display 404 Not Found inside MainLayout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
