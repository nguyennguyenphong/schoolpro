import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Icon } from "@/components/ui/Icon";
import { OTP } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { message } from "@/components/ui/Message";
import { Form } from "antd/lib";

interface VerifyOtpFormValues {
  otp: string;
}

const COUNTDOWN_SECONDS = 60;

export const VerifyOtpPage: React.FC = () => {
  const { t } = useTranslation(["auth", "common", "validation"]);
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const identifier = searchParams.get("identifier") || "email";
  const canResend = countdown <= 0;

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = () => {
    if (!canResend) return;

    setCountdown(COUNTDOWN_SECONDS);

    message.success({
      content: t("auth:verifyOtp.resendSuccess"),
      duration: 3,
    });
  };

  const onFinish = (values: VerifyOtpFormValues) => {
    if (!values.otp || values.otp.length < 6) {
      message.error(t("validation:otpLength"));
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      message.success({
        content: t("auth:verifyOtp.successNotification"),
        duration: 3,
      });

      navigate(
        `/reset-password?identifier=${encodeURIComponent(identifier)}`
      );
    }, 1200);
  };

  return (
    <AuthLayout
      title={t("auth:verifyOtp.title")}
      subtitle={t("auth:verifyOtp.subtitle", { identifier })}
    >
      <Form
        form={form}
        name="verify_otp_form"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        className="flex flex-col items-center"
      >
        <Form.Item
          name="otp"
          rules={[
            { required: true, message: t("validation:otpRequired") },
            { len: 6, message: t("validation:otpLength") },
          ]}
          className="mb-6 w-full flex justify-center"
        >
          <div className="flex justify-center w-full py-2">
            <OTP
              length={6}
              size="large"
              autoFocus
              className="text-lg font-semibold"
            />
          </div>
        </Form.Item>

        <div className="flex items-center justify-between w-full mb-6 text-sm">
          <Link
            to="/forgot-password"
            className="text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
          >
            <Icon name="arrow-left" size={14} />
            <span>{t("auth:verifyOtp.changeIdentifier")}</span>
          </Link>

          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer transition-colors bg-transparent border-none p-0 inline-flex items-center gap-1"
            >
              <Icon name="refresh" size={14} />
              <span>{t("auth:verifyOtp.resendButton")}</span>
            </button>
          ) : (
            <span className="text-slate-400 font-medium">
              {t("auth:verifyOtp.resendCountdown", { seconds: countdown })}
            </span>
          )}
        </div>

        <Form.Item className="mb-4 w-full">
          <Button
            variant="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-semibold rounded-xl text-base shadow-lg shadow-blue-500/20"
          >
            {loading
              ? t("auth:verifyOtp.submitting")
              : t("auth:verifyOtp.submitButton")}
          </Button>
        </Form.Item>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            <Icon name="arrow-left" size={16} />
            <span>{t("auth:forgotPassword.backToLogin")}</span>
          </Link>
        </div>

        <div className="text-center pt-4 mt-6 border-t border-[#f0f0f0] w-full">
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
