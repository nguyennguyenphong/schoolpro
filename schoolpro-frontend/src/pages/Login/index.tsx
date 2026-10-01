import React, { useState } from "react";
import { Form, message } from "antd";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Icon } from "@/components/ui/Icon";
import { Input, Password } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { SelectRole } from "@/components/roles/SelectRole";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { authService } from "@/shared/services/authService";
import { getRoleHomeRoute } from "@/shared/utils/roleRoutes";

interface LoginFormValues {
  role: string;
  code: string;
  password: string;
  remember: boolean;
}

export const LoginPage: React.FC = () => {
  const { t } = useTranslation(["auth", "common", "validation"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, setAuth } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  // If already authenticated, redirect immediately to role home
  if (isAuthenticated) {
    const target = getRoleHomeRoute(role);
    return <Navigate to={target} replace />;
  }

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      const result = await authService.login({
        code: values.code,
        password: values.password,
        role: values.role,
        remember: values.remember,
      });

      // Update global authentication state and persistence
      setAuth({
        access: result.access,
        refresh: result.refresh,
        user: result.user,
        role: result.role,
        remember: values.remember,
      });

      const roleDisplayName = result.role?.name || "Học sinh";
      message.success(
        t("auth:login.successMessage", { role: roleDisplayName })
      );

      // Determine redirect target: return to requested route or role default space
      const stateFrom = (location.state as { from?: { pathname?: string } })?.from?.pathname;
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

  return (
    <AuthLayout
      title={t("auth:login.title")}
      subtitle={t("auth:login.subtitle")}
    >
      <Form
        form={form}
        name="education_login_form"
        layout="vertical"
        initialValues={{ remember: true, role: "student" }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="role"
          label={
            <span className="font-semibold text-slate-700">
              {t("auth:login.roleLabel")}
            </span>
          }
          rules={[{ required: true, message: t("validation:roleRequired") }]}
        >
          <SelectRole />
        </Form.Item>

        <Form.Item
          name="code"
          label={
            <span className="font-semibold text-slate-700">
              {t("auth:login.codeLabel")}
            </span>
          }
          rules={[
            { required: true, message: t("validation:codeRequired") },
            { min: 3, message: t("validation:codeMinLength", { min: 3 }) },
          ]}
          className="mb-4"
        >
          <Input
            prefix={<Icon name="user" size={15} className="text-slate-400 mr-1" />}
            placeholder={t("auth:login.codePlaceholder")}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <span className="font-semibold text-slate-700">
              {t("auth:login.passwordLabel")}
            </span>
          }
          rules={[{ required: true, message: t("validation:passwordRequired") }]}
          className="mb-3"
        >
          <Password
            prefix={<Icon name="password" size={15} className="text-slate-400 mr-1" />}
            placeholder={t("auth:login.passwordPlaceholder")}
            className="rounded-lg"
          />
        </Form.Item>

        <div className="flex items-center justify-between mb-6">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox className="text-slate-600">
              {t("auth:login.rememberMe")}
            </Checkbox>
          </Form.Item>

          <Link
            to="/forgot-password"
            className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium transition-colors"
          >
            {t("auth:login.forgotPassword")}
          </Link>
        </div>

        <Form.Item className="mb-4">
          <Button
            variant="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-semibold rounded-xl text-base shadow-lg shadow-blue-500/20"
          >
            {loading
              ? t("auth:login.submitting")
              : t("auth:login.submitButton")}
          </Button>
        </Form.Item>

        <div className="text-center pt-2 mt-6">
          <p className="text-slate-500 text-sm mb-0">
            {t("auth:login.supportTroubleText")}{" "}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              {t("auth:login.contactIT")}
            </span>
          </p>
        </div>
      </Form>
    </AuthLayout>
  );
};