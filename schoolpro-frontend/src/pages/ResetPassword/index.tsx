import React, { useState } from "react";
import { Form } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Icon } from "@/components/ui/Icon";
import { Password } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { message } from "@/components/ui/Message";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation(["auth", "common", "validation"]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (_values: ResetPasswordFormValues) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      message.success({
        content: t("auth:resetPassword.successNotification"),
        duration: 3,
      });

      navigate("/login");
    }, 1200);
  };

  return (
    <AuthLayout
      title={t("auth:resetPassword.title")}
      subtitle={t("auth:resetPassword.subtitle")}
    >
      <Form
        form={form}
        name="reset_password_form"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="password"
          label={
            <span className="font-semibold text-slate-700">
              {t("auth:resetPassword.newPasswordLabel")}
            </span>
          }
          rules={[
            {
              required: true,
              message: t("validation:passwordRequired"),
            },
            {
              min: 6,
              message: t("validation:passwordMinLength", { min: 6 }),
            },
          ]}
          className="mb-4"
        >
          <Password
            prefix={<Icon name="password" size={15} className="text-slate-400 mr-1" />}
            placeholder={t("auth:resetPassword.newPasswordPlaceholder")}
            className="rounded-lg"
            typeItem="form"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={
            <span className="font-semibold text-slate-700">
              {t("auth:resetPassword.confirmPasswordLabel")}
            </span>
          }
          dependencies={["password"]}
          rules={[
            {
              required: true,
              message: t("validation:confirmPasswordRequired"),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(t("validation:passwordMismatch"))
                );
              },
            }),
          ]}
          className="mb-6"
        >
          <Password
            prefix={<Icon name="password" size={15} className="text-slate-400 mr-1" />}
            placeholder={t("auth:resetPassword.confirmPasswordPlaceholder")}
            className="rounded-lg"
            typeItem="form"
          />
        </Form.Item>

        <Form.Item className="mb-4">
          <Button
            variant="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-semibold rounded-xl text-base shadow-lg shadow-blue-500/20"
          >
            {loading
              ? t("auth:resetPassword.submitting")
              : t("auth:resetPassword.submitButton")}
          </Button>
        </Form.Item>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            <Icon name="arrow-left" size={16} />
            <span>{t("auth:resetPassword.backToLogin")}</span>
          </Link>
        </div>

        <div className="text-center pt-4 mt-6 border-t border-[#f0f0f0]">
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
