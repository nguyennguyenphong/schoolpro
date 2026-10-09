import React from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton, SkeletonButton, SkeletonAvatar } from "@/components/ui/Skeleton";

/**
 * Pixel-accurate Skeleton for AssignmentSubmitPage to eliminate layout shift (CLS).
 * Mirrors exact container classes, paddings, borders, flex layouts, and headers.
 */
export const AssignmentDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Page Header with Breadcrumb & Back Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>Trang chủ</span>
                </span>
              ),
            },
            {
              href: "/student/assignments",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Icon name="edit" size={13} className="text-slate-400 shrink-0" />
                  <span>Bài tập & Nhiệm vụ</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <span>Chi tiết & Nộp bài</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <SkeletonButton active size="default" style={{ width: 280, height: 26 }} />
              <SkeletonButton active size="small" style={{ width: 80, height: 22 }} />
              <SkeletonButton active size="small" style={{ width: 90, height: 22 }} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
              <SkeletonButton active size="small" style={{ width: 340, height: 16 }} />
            </div>
          </div>

          <Button variant="outline" disabled className="self-start sm:self-auto shrink-0">
            <Icon name="arrow-left" size={13} className="mr-1.5" />
            <span>Quay lại</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Column (2 spans): Requirements, Attachments & Submission Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Card 1: Requirements */}
          <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
              <h3 className="text-base font-bold text-slate-900 mb-0">
                Nội dung yêu cầu đề bài
              </h3>
            </div>
            <div className="py-1">
              <Skeleton active paragraph={{ rows: 3 }} title={false} />
            </div>
          </div>

          {/* Card 2: Teacher Attachments */}
          <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
                <h3 className="text-base font-bold text-slate-900 mb-0">
                  Tài liệu & Đề bài đính kèm của giáo viên
                </h3>
              </div>
              <SkeletonButton active size="small" style={{ width: 45, height: 18 }} />
            </div>

            <div className="space-y-2">
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-[#f0f0f0]/80 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5 flex-1 pr-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon name="file" size={16} />
                    </div>
                    <div className="flex-1">
                      <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 1, width: "30%" }} />
                    </div>
                  </div>
                  <SkeletonButton active size="small" style={{ width: 70, height: 28 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Submission Form Area */}
          <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
                <h3 className="text-base font-bold text-slate-900 mb-0">
                  Nộp bài tập trực tuyến
                </h3>
              </div>
            </div>

            <div className="p-6 border-2 border-dashed border-[#f0f0f0] rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <SkeletonAvatar active shape="circle" size={48} className="mb-2" />
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

        {/* Right Column (1 span): Status, Teacher info & Guidelines */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-5">
          {/* Card 1: Status & Deadline */}
          <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-0">Trạng thái nộp bài</h3>
              <SkeletonButton active size="small" style={{ width: 70, height: 20 }} />
            </div>
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
          </div>

          {/* Card 2: Teacher Info */}
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Thông tin giáo viên phụ trách
            </span>
            <div className="flex items-center gap-3">
              <SkeletonAvatar active shape="circle" size={42} />
              <div className="flex-1">
                <Skeleton active title={{ width: "65%" }} paragraph={{ rows: 1, width: "80%" }} />
              </div>
            </div>
          </div>

          {/* Card 3: Guidelines */}
          <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-slate-50/60 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
              <Icon name="info" size={14} className="text-blue-600 shrink-0" />
              <span>Lưu ý khi nộp bài:</span>
            </div>
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
