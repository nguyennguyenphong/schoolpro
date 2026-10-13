import React from "react";
import { message } from "@/components/ui/Message";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { AssignmentAttachment } from "@/modules/students/features/assignments/types";

interface AssignmentTeacherAttachmentsProps {
  attachments?: AssignmentAttachment[];
  onPreviewPdf: (file: { url: string; name: string; size: string }) => void;
  embedded?: boolean;
}

export const AssignmentTeacherAttachments: React.FC<AssignmentTeacherAttachmentsProps> = ({
  attachments,
  onPreviewPdf,
  embedded = false,
}) => {
  const { t } = useTranslation(["card", "button"]);

  if (!attachments || attachments.length === 0) return null;

  const content = (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="paperclip" size={14} className="text-blue-600 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-0 truncate">
            {t("card:assignments.detail.teacherAttachmentsTitle")}
          </h4>
        </div>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg shrink-0 whitespace-nowrap">
          {t("card:assignments.detail.filesUnit", { count: attachments.length })}
        </span>
      </div>

      {/* 1 file per row so file names and buttons never wrap */}
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
              className={`flex items-center justify-between gap-3 p-3 bg-slate-50/80 border border-[#f0f0f0] rounded-xl text-xs transition-all ${
                isPdf
                  ? "hover:border-rose-400 hover:bg-rose-50/30 cursor-pointer group"
                  : "hover:border-blue-400 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isPdf
                      ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                      : "bg-blue-50 text-blue-600 border border-blue-200/60"
                  }`}
                >
                  <Icon name="file" size={15} />
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`font-semibold text-slate-800 truncate ${
                      isPdf ? "group-hover:text-rose-700" : ""
                    }`}
                  >
                    {file.name}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                    ({file.size})
                  </span>
                  {isPdf && (
                    <span className="text-rose-600 font-semibold bg-rose-50 border border-rose-200/70 px-1.5 py-0.5 rounded text-[10px] shrink-0 whitespace-nowrap">
                      {t("card:assignments.uploader.pdfFormat")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isPdf && (
                  <Button
                    variant="outline"
                    className="shrink-0 whitespace-nowrap text-xs h-7 px-2.5 border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewPdf({
                        url: file.url || "/sample-notice.pdf",
                        name: file.name,
                        size: file.size,
                      });
                    }}
                  >
                    <Icon name="eye" size={12} />
                    <span>{t("button:preview")}</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="shrink-0 whitespace-nowrap text-xs h-7 px-2.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    message.info(`${t("button:download")}: ${file.name}`);
                  }}
                >
                  <Icon name="download" size={12} />
                  <span>{t("button:download")}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (embedded) {
    return <div className="pt-3.5 border-t border-slate-100">{content}</div>;
  }

  return (
    <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs">
      {content}
    </div>
  );
};
