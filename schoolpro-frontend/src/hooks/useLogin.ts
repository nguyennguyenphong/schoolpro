import { useState } from "react";
import { Form } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { authService } from "@/shared/services/authService";
import { getRoleHomeRoute } from "@/shared/utils/roleRoutes";
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
       * If the user was redirected to the login page from another page, navigate back to that page.
       * Otherwise, navigate to the home route based on the user's role.
       */
      const stateFrom = (location.state as { from?: { pathname?: string } })
        ?.from?.pathname;
      const targetDestination =
        stateFrom && stateFrom !== "/login" && stateFrom !== "/"
          ? stateFrom
          : getRoleHomeRoute(result.role?.code || values.role);

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
