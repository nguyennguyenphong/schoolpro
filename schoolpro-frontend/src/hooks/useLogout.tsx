import { Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/shared/store/useAuthStore";

export const useLogout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["modal", "button", "message", "common"]);
  const { logout } = useAuthStore();

  const logoutWithConfirm = () => {
    Modal.confirm({
      title: t("modal:logoutConfirmTitle"),
      content: t("modal:logoutConfirmContent"),
      okText: t("button:logout"),
      cancelText: t("button:cancel"),
      okButtonProps: {
        danger: true,
      },

      onOk: () => {
        logout();

        message.success(
          t("message:logoutSuccess"),
        );

        navigate("/login", {
          replace: true,
        });
      },

      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      ),
    });
  };

  return {
    logout: logoutWithConfirm,
  };
};
