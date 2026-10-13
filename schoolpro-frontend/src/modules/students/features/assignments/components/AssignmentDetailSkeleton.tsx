import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton, SkeletonButton, SkeletonAvatar } from "@/components/ui/Skeleton";

/**
 * Pixel-accurate Skeleton for AssignmentSubmitPage to eliminate layout shift (CLS).
 * Mirrors AssignmentSubmitHeader, AssignmentWorkflowCard, AssignmentContentTabsCard, and AssignmentSubmitSidebar.
 */
export const AssignmentDetailSkeleton: React.FC = () => {
  const { t } = useTranslation(["card", "button", "navigation"]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-8">
      {/* 1. Page Header with Breadcrumb & Back Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("navigation:breadcrumb.home")}</span>
                </span>
              ),
            },
            {
              href: "/student/assignments",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Icon name="edit" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("navigation:breadcrumb.assignments")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <span>{t("card:assignments.detail.breadcrumbDetail")}</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <SkeletonButton active size="default" style={{ width: 280, height: 26 }} />
              <SkeletonButton active size="small" style={{ width: 80, height: 22 }} />
              <SkeletonButton active size="small" style={{ width: 90, height: 22 }} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
              <SkeletonButton active size="small" style={{ width: 340, height: 16 }} />
            </div>
          </div>

          <Button variant="outline" disabled className="self-start lg:self-auto shrink-0">
            <Icon name="arrow-left" size={14} />
            <span>{t("button:assignmentsList")}</span>
          </Button>
        </div>
      </div>

      {/* 2. Workflow Steps Card Skeleton */}
      <div className="w-full bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
              {t("card:assignments.detail.workflowTitle")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <SkeletonButton active size="small" style={{ width: 140, height: 24 }} />
            <SkeletonButton active size="small" style={{ width: 90, height: 24 }} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <SkeletonAvatar active shape="circle" size={24} />
              <div className="flex-1">
                <Skeleton active title={{ width: "70%" }} paragraph={{ rows: 1, width: "90%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (2 spans): Tabbed Content + Submission Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Card 1: Tabbed Requirements & Attachments */}
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-2.5 border-b border-slate-100">
              <SkeletonButton active size="small" style={{ width: 160, height: 24 }} />
              <SkeletonButton active size="small" style={{ width: 150, height: 24 }} />
              <SkeletonButton active size="small" style={{ width: 140, height: 24 }} />
            </div>
            <div className="p-4 bg-slate-50/70 border border-[#f0f0f0] rounded-xl">
              <Skeleton active paragraph={{ rows: 3 }} title={false} />
            </div>
            <div className="pt-3.5 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="paperclip" size={14} className="text-blue-600 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-0">
                    {t("card:assignments.detail.teacherAttachmentsTitle")}
                  </h4>
                </div>
                <SkeletonButton active size="small" style={{ width: 45, height: 18 }} />
              </div>
              <div className="space-y-2">
                {[1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50/80 border border-[#f0f0f0] rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5 flex-1 pr-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon name="file" size={15} />
                      </div>
                      <div className="flex-1">
                        <Skeleton active title={{ width: "60%" }} paragraph={false} />
                      </div>
                    </div>
                    <SkeletonButton active size="small" style={{ width: 70, height: 28 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Submission Form Area */}
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
                <h3 className="text-base font-bold text-slate-900 mb-0">
                  {t("card:assignments.detail.submissionAreaTitle")}
                </h3>
              </div>
            </div>

            <div className="p-6 border-2 border-dashed border-[#f0f0f0] rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <SkeletonAvatar active shape="circle" size={44} className="mb-2" />
              <Skeleton active paragraph={{ rows: 2, width: ["50%", "30%"] }} title={false} />
            </div>

            <div className="pt-2">
              <Skeleton active paragraph={{ rows: 2 }} title={{ width: "25%" }} />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <SkeletonButton active size="default" style={{ width: 130 }} />
            </div>
          </div>
        </div>

        {/* Right Column (1 span): 2 Tabbed Sidebar Cards */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <SkeletonButton active size="small" style={{ width: 120, height: 22 }} />
              <SkeletonButton active size="small" style={{ width: 110, height: 22 }} />
            </div>
            <Skeleton active paragraph={{ rows: 5 }} title={false} />
          </div>

          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <SkeletonButton active size="small" style={{ width: 110, height: 22 }} />
              <SkeletonButton active size="small" style={{ width: 130, height: 22 }} />
            </div>
            <Skeleton active paragraph={{ rows: 4 }} title={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
