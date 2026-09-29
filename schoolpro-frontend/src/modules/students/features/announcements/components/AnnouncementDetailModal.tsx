import React from "react";
import { Modal, Tag, message } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AnnouncementItem } from "@/modules/students/features/announcements/types";

interface AnnouncementDetailModalProps {
  item: AnnouncementItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!item) return null;

  const handleDownload = (fileName: string) => {
    message.success(`Đang tải xuống tệp: ${fileName}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
    >
      <div className="space-y-5 pt-2">
        {/* Header tags & date */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag color="blue" className="m-0 font-medium">
              {item.department}
            </Tag>
            {item.isPinned && (
              <Tag color="gold" className="m-0 font-semibold">
                Ghim đầu trang
              </Tag>
            )}
            {item.priority === "urgent" && (
              <Tag color="red" className="m-0 font-semibold">
                Khẩn cấp
              </Tag>
            )}
            {item.targetAudience && (
              <Tag color="default" className="m-0">
                Đối tượng: {item.targetAudience}
              </Tag>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Icon name="clock" size={13} />
            <span>{item.publishDate}</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-1">
            {item.title}
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Người đăng: <strong className="text-slate-700">{item.author}</strong></span>
            <span>•</span>
            <span>Lượt xem: <strong className="text-slate-700">{item.viewsCount}</strong></span>
          </div>
        </div>

        {/* Summary box */}
        <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          {item.summary}
        </div>

        {/* Content body */}
        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line py-2 max-h-[45vh] overflow-y-auto pr-1">
          {item.content}
        </div>

        {/* Attachments */}
        {item.attachments && item.attachments.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Icon name="download" size={14} className="text-blue-600" />
              <span>Tài liệu đính kèm ({item.attachments.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.attachments.map((att) => (
                <div
                  key={att.id}
                  onClick={() => handleDownload(att.name)}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 group-hover:border-blue-400">
                      <Icon name="file" size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 truncate mb-0">
                        {att.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {att.size}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"                    
                    className="p-1 h-auto text-slate-400 group-hover:text-blue-600"
                  >
                    <Icon name="download" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={handlePrint}
          >
            <Icon name="file" size={14} className="mr-1.5" />
            In văn bản
          </Button>

          <Button
            variant="primary"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
