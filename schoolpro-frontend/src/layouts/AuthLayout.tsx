import React from "react";
import { useTranslation } from "react-i18next";
import LeftImage from "@/assets/images/left_login.png";
import { Icon } from "@/components/ui/Icon";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { LanguageSwitcher } from "@/i18n";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { t } = useTranslation(["common", "auth"]);

  return (
    <div className="min-h-screen w-full flex overflow-x-hidden font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white items-center justify-center p-12 xl:p-16">
        <div className="absolute inset-0 z-0 flex items-center justify-center p-12">
          <img
            src={LeftImage}
            alt="Login Illustration"
            className="w-full h-full object-contain object-center"
          />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between w-full max-w-xl">
          <div className="text-xs text-slate-500 flex justify-between items-center bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-sm border border-slate-100">
            <span>{t("common:footer.copyright")}</span>
            <span className="hover:text-blue-600 transition-colors cursor-pointer font-medium">
              {t("common:footer.technicalSupport")}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12 lg:p-16 relative">
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
          <LanguageSwitcher width={140} />
        </div>

        <Card className="w-full max-w-110 p-8 sm:p-10">
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
              <Icon name="book" className="text-xl text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 block leading-tight">
                {t("common:brand.title")}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {t("common:brand.tagline")}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <Typography
              variant="h5"
              className="text-slate-900! font-bold! text-2xl! sm:text-3xl! mb-2!"
            >
              {title}
            </Typography>
            <Typography
              variant="body"
              className="text-slate-500! mb-0! text-sm leading-relaxed"
            >
              {subtitle}
            </Typography>
          </div>

          <div className="auth-form-container">{children}</div>
        </Card>
      </div>
    </div>
  );
};
