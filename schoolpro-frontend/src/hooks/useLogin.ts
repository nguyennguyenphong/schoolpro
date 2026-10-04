import { useState } from "react";
import { Form } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { authService } from "@/shared/services/authService";
import { getRoleHomeRoute, validateRedirectForRole } from "@/shared/utils/roleRoutes";
import { message } from "@/components/ui/Message";
import type { LoginFormValues } from "@/types";

export const useLogin = () => {
  const { t } = useTranslation(["auth", "common", "validation"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      const result = await authService.login({
        code: values.code,
        password: values.password,
        role: values.role,
        remember: values.remember,
      });

      /**
       * Update authentication state
       * @see src/shared/store/useAuthStore
       */
      setAuth({
        access: result.access,
        refresh: result.refresh,
        user: result.user,
        role: result.role,
        academic_context: result.academic_context,
        profile: result.profile,
        remember: values.remember,
      });

      const roleDisplayName = result.role?.name || "Học sinh";
      message.success(
        t("auth:login.successMessage", { role: roleDisplayName }),
      );

      /**
       * Determine the target destination after login
       * Priority:
       * 1. Query parameter `redirect` from URL (e.g. /login?redirect=/student/notices?pageSize=10)
       * 2. React Router location.state.from (from ProtectedRoute)
       * 3. Fallback to default role home route (e.g. /student/home)
       */
      const searchParams = new URLSearchParams(location.search);
      const queryRedirect = searchParams.get("redirect");

      const stateLocation = (location.state as { from?: { pathname?: string; search?: string } })
        ?.from;
      const stateRedirect = stateLocation
        ? `${stateLocation.pathname || ""}${stateLocation.search || ""}`
        : null;

      const userRole = result.role?.code || values.role;
      const validQueryRedirect = validateRedirectForRole(queryRedirect, userRole);
      const validStateRedirect = validateRedirectForRole(stateRedirect, userRole);

      const targetDestination =
        validQueryRedirect ||
        validStateRedirect ||
        getRoleHomeRoute(userRole);

      navigate(targetDestination, { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    form,
    onFinish,
  };
};
