import React from "react";
import { message as antMessage } from "antd";

import type {
  ArgsProps,
  ConfigOptions,
  JointContent,
  MessageType,
} from "antd/es/message/interface";
import {
  DEFAULT_MESSAGE_DURATION,
  DEFAULT_MESSAGE_MAX_COUNT,
  DEFAULT_MESSAGE_TOP,
} from "@/components/ui/Message/constants";

// Configure enterprise default values for global toast notifications
antMessage.config({
  duration: DEFAULT_MESSAGE_DURATION,
  maxCount: DEFAULT_MESSAGE_MAX_COUNT,
  top: DEFAULT_MESSAGE_TOP,
});

/**
 * Enterprise Message notification service wrapping Ant Design's message.
 * Provides accessible, standardized toast notifications.
 */
export const message = {
  success: (
    content: JointContent,
    duration?: number | VoidFunction,
    onClose?: VoidFunction,
  ): MessageType => antMessage.success(content, duration, onClose),

  error: (
    content: JointContent,
    duration?: number | VoidFunction,
    onClose?: VoidFunction,
  ): MessageType => antMessage.error(content, duration, onClose),

  info: (
    content: JointContent,
    duration?: number | VoidFunction,
    onClose?: VoidFunction,
  ): MessageType => antMessage.info(content, duration, onClose),

  warning: (
    content: JointContent,
    duration?: number | VoidFunction,
    onClose?: VoidFunction,
  ): MessageType => antMessage.warning(content, duration, onClose),

  loading: (
    content: JointContent,
    duration?: number | VoidFunction,
    onClose?: VoidFunction,
  ): MessageType => antMessage.loading(content, duration, onClose),

  open: (args: ArgsProps): MessageType => antMessage.open(args),

  destroy: (key?: React.Key): void => antMessage.destroy(key),

  config: (options: ConfigOptions): void => antMessage.config(options),

  useMessage: antMessage.useMessage,
};

// Aliases for convenient importing styles
export const Message = message;
export const useMessage = antMessage.useMessage;
