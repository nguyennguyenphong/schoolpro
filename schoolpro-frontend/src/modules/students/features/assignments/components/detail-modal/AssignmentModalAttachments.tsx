import React from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { message } from "@/components/ui/Message";
import type { AssignmentAttachment } from "@/modules/students/features/assignments/types";

interface AssignmentModalAttachmentsProps {
  attachments?: AssignmentAttachment[];
  onPreviewPdf: (pdf: { url: string; name: string; size: string }) => void;
}

export const AssignmentModalAttachments: React.FC<AssignmentModalAttachmentsProps> = ({
  attachments,
  onPreviewPdf,
}) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
        Tài liệu & Tệp đính kèm ({attachments.length})
      </h4>
      <div className="space-y-1.5">
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
              className={`flex items-center justify-between p-2.5 bg-white border border-[#f0f0f0] rounded-lg text-xs transition-colors ${
                isPdf
                  ? "hover:border-rose-400 hover:bg-rose-50/30 cursor-pointer group"
                  : "hover:border-blue-400"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isPdf
                      ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Icon name="file" size={14} />
                </div>
                <div className="min-w-0 truncate">
                  <span
                    className={`font-medium text-slate-800 truncate block ${
                      isPdf ? "group-hover:text-rose-700" : ""
                    }`}
                  >
                    {file.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>{file.size}</span>
                    {isPdf && (
                      <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">
                        PDF
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isPdf && (
                  <Button
                    variant="outline"
                    className="text-xs h-7 px-2 shrink-0 border-rose-200 text-rose-600 hover:bg-rose-50"
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
                    Xem trước
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-xs h-7 px-2 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    message.info(`Đang tải xuống: ${file.name}`);
                  }}
                >
                  <Icon name="download" size={12} />
                  Tải về
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
