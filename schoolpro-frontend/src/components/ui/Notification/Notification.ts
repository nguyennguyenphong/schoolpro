import React from "react";
import { notification as antNotification } from "antd";

import type {
  ArgsProps,
  GlobalConfigProps,
} from "antd/es/notification/interface";
import {
  DEFAULT_NOTIFICATION_BOTTOM,
  DEFAULT_NOTIFICATION_DURATION,
  DEFAULT_NOTIFICATION_PLACEMENT,
  DEFAULT_NOTIFICATION_TOP,
} from "@/components/ui/Notification/constants";

// Configure enterprise default values for global notifications
antNotification.config({
  duration: DEFAULT_NOTIFICATION_DURATION,
  placement: DEFAULT_NOTIFICATION_PLACEMENT,
  top: DEFAULT_NOTIFICATION_TOP,
  bottom: DEFAULT_NOTIFICATION_BOTTOM,
});

/**
 * Enterprise Notification service wrapping Ant Design's notification.
 * Provides accessible, styled floating notification messages.
 */
export const notification = {
  success: (args: ArgsProps): void => antNotification.success(args),

  error: (args: ArgsProps): void => antNotification.error(args),

  info: (args: ArgsProps): void => antNotification.info(args),

  warning: (args: ArgsProps): void => antNotification.warning(args),

  open: (args: ArgsProps): void => antNotification.open(args),

  destroy: (key?: React.Key): void => antNotification.destroy(key),

  config: (options: GlobalConfigProps): void => antNotification.config(options),

  useNotification: antNotification.useNotification,
};

// Aliases for convenient importing styles
export const Notification = notification;
export const useNotification = antNotification.useNotification;
