import React from "react";
import { message } from "@/components/ui/Message";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { AssignmentAttachment } from "@/modules/students/features/assignments/types";

interface AssignmentTeacherAttachmentsProps {
  attachments?: AssignmentAttachment[];
  onPreviewPdf: (file: { url: string; name: string; size: string }) => void;
}

export const AssignmentTeacherAttachments: React.FC<AssignmentTeacherAttachmentsProps> = ({
  attachments,
  onPreviewPdf,
}) => {
  const { t } = useTranslation(["card", "button"]);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:assignments.detail.teacherAttachmentsTitle")}
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          {t("card:assignments.detail.filesUnit", { count: attachments.length })}
        </span>
      </div>

      <div className="space-y-2">
        {attachments.map((file, idx) => {
          const isPdf =
            file.name.toLowerCase().endsWith(".pdf") ||
            (file.url ? file.url.toLowerCase().endsWith(".pdf") : false);

          return (
            <div
              key={idx}
              onClick={() => {
                if (isPdf) {
                  onPreviewPdf({
                    url: file.url || "/sample-notice.pdf",
                    name: file.name,
                    size: file.size,
                  });
                }
              }}
              className={`flex items-center justify-between p-3 bg-slate-50 border border-[#f0f0f0]/80 rounded-xl text-xs transition-all ${
                isPdf
                  ? "hover:border-rose-400 hover:bg-rose-50/30 cursor-pointer group"
                  : "hover:border-blue-400 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isPdf
                      ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Icon name="file" size={16} />
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-semibold text-slate-800 block truncate ${
                      isPdf ? "group-hover:text-rose-700" : ""
                    }`}
                  >
                    {file.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{file.size}</span>
                    {isPdf && (
                      <span className="text-rose-600 font-semibold bg-rose-50 px-1 rounded text-[10px]">
                        {t("card:assignments.uploader.pdfFormat")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isPdf && (
                  <Button
                    variant="outline"
                    className="shrink-0 text-xs h-7 px-2.5 border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewPdf({
                        url: file.url || "/sample-notice.pdf",
                        name: file.name,
                        size: file.size,
                      });
                    }}
                  >
                    <Icon name="eye" size={12} className="mr-1" />
                    {t("button:preview")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="shrink-0 text-xs h-7 px-2.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    message.info(`${t("button:download")}: ${file.name}`);
                  }}
                >
                  <Icon name="download" size={12} className="mr-1" />
                  {t("button:download")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
