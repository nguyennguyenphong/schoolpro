import React from "react";
import { useIdleTimer } from "@/shared/hooks/useIdleTimer";

/**
 * Headless watcher component that monitors user inactivity
 * and performs automated session logout when the idle threshold is exceeded.
 */
export const IdleTimerWatcher: React.FC = () => {
  useIdleTimer();
  return null;
};
