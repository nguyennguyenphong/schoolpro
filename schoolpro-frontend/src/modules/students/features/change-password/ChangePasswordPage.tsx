import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Icon } from "@/components/ui/Icon";
import { useChangePassword } from "@/modules/students/features/change-password/hooks/useChangePassword";
import { ChangePasswordForm } from "@/modules/students/features/change-password/components/ChangePasswordForm";
import { ChangePasswordSuccessModal } from "@/modules/students/features/change-password/components/ChangePasswordSuccessModal";

export const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation(["navigation", "card", "common", "input"]);
  const {
    submitting,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    setNewPasswordValue,
    evaluation,
    handleChangePassword,
  } = useChangePassword();

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("navigation:breadcrumb.home")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="lock" size={13} className="text-blue-600 shrink-0" />
                  <span>{t("navigation:breadcrumb.changePassword")}</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
                {t("navigation:pageTitle.changePassword")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              {t("navigation:pageSubtitle.changePassword")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid (Two Column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-5 sm:p-7 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  <Icon name="lock" size={18} />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0">
                    {t("card:password.title")}
                  </h2>
                  <p className="text-xs text-slate-500 mb-0">
                    {t("card:password.subtitle")}
                  </p>
                </div>
              </div>
            </div>

            <ChangePasswordForm
              evaluation={evaluation}
              onNewPasswordChange={setNewPasswordValue}
              onSubmit={handleChangePassword}
              submitting={submitting}
            />
          </div>
        </div>

        {/* Right Column: Security Guidelines Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <Icon name="info" size={18} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-0">
                  Khuyến nghị bảo mật học đường
                </h3>
                <p className="text-[11px] text-slate-400 mb-0">
                  Quy định an toàn thông tin của School Pro
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 list-none p-0 m-0">
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  1
                </span>
                <span>
                  <strong>Không đặt mật khẩu đơn giản:</strong> Tránh dùng ngày sinh, số điện thoại, họ tên hoặc dãy số liên tiếp như 123456.
                </span>
              </li>

              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  2
                </span>
                <span>
                  <strong>Thay đổi định kỳ:</strong> Nên đổi mật khẩu mỗi 3 tháng hoặc ngay khi nghi ngờ tài khoản bị lộ tại máy tính công cộng của trường.
                </span>
              </li>

              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  3
                </span>
                <span>
                  <strong>Không chia sẻ tài khoản:</strong> Tuyệt đối không cung cấp thông tin đăng nhập cho bạn bè hoặc người khác mượn làm bài thi.
                </span>
              </li>

              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  4
                </span>
                <span>
                  <strong>Đăng xuất sau khi dùng:</strong> Luôn bấm "Đăng xuất" khi sử dụng máy tính tại phòng máy thực hành hoặc thư viện.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ChangePasswordSuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};
