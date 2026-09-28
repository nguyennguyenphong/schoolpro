import React, { useState, useMemo } from "react";
import { Form, Select, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Icon } from "@/components/ui/Icon";
import { Input, Password } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { useAuthStore } from "@/shared/store/useAuthStore";

interface LoginFormValues {
  role: string;
  code: string;
  password_: string;
  remember: boolean;
}

export const LoginPage: React.FC = () => {
  const { t } = useTranslation(["auth", "common", "validation"]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onFinish = (values: LoginFormValues) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      login(values.role, "mock-auth-token-2026");

      message.success({
        content: t("auth:login.successMessage", {
          role: values.role.toUpperCase(),
        }),
        duration: 3,
      });

      if (values.role === "student" || values.role === "parent") {
        navigate("/student/home");
      }
    }, 1200);
  };

  const optionRole = useMemo(
    () => [
      { id: 1, value: "admin", label: t("auth:roles.admin") },
      { id: 2, value: "teacher", label: t("auth:roles.teacher") },
      { id: 3, value: "student", label: t("auth:roles.student") },
      { id: 4, value: "parent", label: t("auth:roles.parent") },
      { id: 5, value: "staff", label: t("auth:roles.staff") },
    ],
    [t]
  );

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
          <Select
            placeholder={t("auth:login.rolePlaceholder")}
            className="w-full"
            options={optionRole}
          />
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
            typeItem="form"
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
            typeItem="form"
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