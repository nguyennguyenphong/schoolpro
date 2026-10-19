import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon/types";

export interface ProfileStepItem {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  iconName: IconName;
}

interface ProfileStepperNavProps {
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
  steps: ProfileStepItem[];
  disabled?: boolean;
}

export const ProfileStepperNav: React.FC<ProfileStepperNavProps> = ({
  currentStep,
  onStepChange,
  steps,
  disabled = false,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {steps.map((step, idx) => {
        const isActive = currentStep === idx;
        const isCompleted = idx < currentStep;

        return (
          <button
            type="button"
            key={step.id}
            onClick={() => !disabled && onStepChange(idx)}
            disabled={disabled}
            aria-current={isActive ? "step" : undefined}
            className={`
              relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? "bg-linear-to-r from-blue-50 via-indigo-50/50 to-blue-50/80 border border-blue-600 shadow-sm"
                  : isCompleted
                    ? "bg-emerald-50/50 border border-emerald-200 hover:bg-emerald-50/80 hover:border-emerald-300"
                    : "bg-slate-50/60 border border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            {/* Step Icon Badge */}
            <span
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold scale-105"
                    : isCompleted
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-200/90 text-slate-600"
                }
              `}
            >
              {isCompleted ? (
                <Icon name="check" size={15} />
              ) : (
                <Icon name={step.iconName} size={15} />
              )}
            </span>

            {/* Step Text Metadata */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isActive
                      ? "text-blue-700 font-black"
                      : isCompleted
                        ? "text-emerald-700"
                        : "text-slate-500"
                  }`}
                >
                  {step.stepNumber}
                </span>

                {isActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100/90 px-1.5 py-0.5 rounded-full shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    {t("card:profile.stepInProgress")}
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
                    <Icon name="check" size={10} />
                    {t("card:profile.stepCompleted")}
                  </span>
                )}
              </div>

              <h4
                className={`text-xs sm:text-sm font-bold truncate mb-0 ${
                  isActive
                    ? "text-blue-950 font-extrabold"
                    : isCompleted
                      ? "text-slate-800"
                      : "text-slate-600"
                }`}
              >
                {step.title}
              </h4>
              <p
                className={`text-[11px] truncate mb-0 hidden sm:block ${
                  isActive
                    ? "text-blue-700 font-medium"
                    : isCompleted
                      ? "text-emerald-700/80 font-normal"
                      : "text-slate-500"
                }`}
              >
                {step.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
