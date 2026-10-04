import { Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/shared/store/useAuthStore";

export const useLogout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const { logout } = useAuthStore();

  const logoutWithConfirm = () => {
    Modal.confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?",

      onOk: () => {
        logout();

        message.success(
          t("common:status.success"),
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
