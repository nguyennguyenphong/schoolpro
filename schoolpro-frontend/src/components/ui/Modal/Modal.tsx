import React from "react";
import { Modal as AntModal } from "antd";

import type { ModalProps } from "@/components/ui/Modal/types";
import { MODAL_SIZES } from "@/components/ui/Modal/constants";
import { modalStyles } from "@/components/ui/Modal/styles";

export const Modal: React.FC<ModalProps> & {
  info: typeof AntModal.info;
  success: typeof AntModal.success;
  error: typeof AntModal.error;
  warning: typeof AntModal.warning;
  warn: typeof AntModal.warn;
  confirm: typeof AntModal.confirm;
  destroyAll: typeof AntModal.destroyAll;
  config: typeof AntModal.config;
  useModal: typeof AntModal.useModal;
} = ({
  size,
  width,
  centered = true,
  destroyOnHidden = true,
  styles,
  rootClassName = "",
  ...props
}) => {
  const calculatedWidth = width ?? (size ? MODAL_SIZES[size] : undefined);

  const mergedStyles =
    typeof styles === "function"
      ? (info: Parameters<Extract<ModalProps["styles"], (...args: any[]) => any>>[0]) => {
          const resolved = styles(info);
          return {
            ...resolved,
            header: { ...modalStyles.header, ...resolved?.header },
            body: { ...modalStyles.body, ...resolved?.body },
            footer: { ...modalStyles.footer, ...resolved?.footer },
            container: { ...modalStyles.container, ...resolved?.container },
            mask: { ...modalStyles.mask, ...resolved?.mask },
          };
        }
      : {
          ...styles,
          header: { ...modalStyles.header, ...styles?.header },
          body: { ...modalStyles.body, ...styles?.body },
          footer: { ...modalStyles.footer, ...styles?.footer },
          container: { ...modalStyles.container, ...styles?.container },
          mask: { ...modalStyles.mask, ...styles?.mask },
        };

  return (
    <AntModal
      centered={centered}
      destroyOnHidden={destroyOnHidden}
      width={calculatedWidth}
      styles={mergedStyles}
      rootClassName={`custom-modal ${rootClassName}`.trim()}
      {...props}
    />
  );
};

Modal.displayName = "Modal";

// Attach Ant Design static confirmation and dialog methods
Modal.info = AntModal.info;
Modal.success = AntModal.success;
Modal.error = AntModal.error;
Modal.warning = AntModal.warning;
Modal.warn = AntModal.warn;
Modal.confirm = AntModal.confirm;
Modal.destroyAll = AntModal.destroyAll;
Modal.config = AntModal.config;
Modal.useModal = AntModal.useModal;
