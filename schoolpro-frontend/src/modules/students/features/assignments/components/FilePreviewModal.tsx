import React from "react";
import { Modal } from "antd";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PdfViewer } from "@/components/pdf";
import type { SubmittedFile } from "@/modules/students/features/assignments/types";
import { FILE_CATEGORIES_META } from "@/modules/students/features/assignments/utils/fileUtils";

interface FilePreviewModalProps {
  file: SubmittedFile | null;
  open: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  open,
  onClose,
}) => {
  if (!file) return null;

  const meta = FILE_CATEGORIES_META[file.type] || FILE_CATEGORIES_META.other;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden      
      width={
        file.type === "pdf"
          ? 960
          : file.type === "video" || file.type === "image"
            ? 760
            : 540
      }
      centered
      title={
        <div className="flex items-center gap-2.5 pr-6">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.theme.iconBg}`}
          >
            <Icon name={meta.iconName} size={15} />
          </div>
          <div className="truncate">
            <h4 className="text-sm font-bold text-slate-900 truncate mb-0">
              {file.name}
            </h4>
            <span className="text-[11px] text-slate-500 font-normal">
              {meta.title} • {file.size}
            </span>
          </div>
        </div>
      }
    >
      <div className="py-3 space-y-4">
        {/* IMAGE PREVIEW */}
        {file.type === "image" && (
          <div className="flex flex-col items-center justify-center bg-slate-900/5 rounded-xl p-2 border border-[#f0f0f0] overflow-hidden">
            {file.previewUrl ? (
              <img
                src={file.previewUrl}
                alt={file.name}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-xs"
              />
            ) : (
              <div className="py-16 text-center text-slate-400">
                <Icon name="image" size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Xem trước hình ảnh: {file.name}</p>
              </div>
            )}
          </div>
        )}

        {/* VIDEO PREVIEW */}
        {file.type === "video" && (
          <div className="bg-black rounded-xl overflow-hidden shadow-md">
            {file.previewUrl ? (
              <video
                src={file.previewUrl}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain"
              >
                Trình duyệt của bạn không hỗ trợ phát video này.
              </video>
            ) : (
              <div className="py-20 text-center text-slate-300">
                <Icon name="video" size={48} className="mx-auto mb-2 opacity-60 text-purple-400" />
                <p className="text-xs">Trình phát video xem trước: {file.name}</p>
              </div>
            )}
          </div>
        )}

        {/* AUDIO PREVIEW */}
        {file.type === "audio" && (
          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
              <Icon name="music" size={28} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-0.5">{file.name}</h4>
              <p className="text-xs text-amber-700">Tệp ghi âm / âm thanh phát âm ({file.size})</p>
            </div>
            {file.previewUrl ? (
              <div className="pt-2">
                <audio src={file.previewUrl} controls className="w-full">
                  Trình duyệt không hỗ trợ phát âm thanh này.
                </audio>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                (Tệp ghi âm sẵn sàng nộp cho giáo viên kiểm tra)
              </div>
            )}
          </div>
        )}

        {/* WORD DOCUMENT PREVIEW */}
        {file.type === "word" && (
          <div className="p-6 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 font-bold text-xl">
              W
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-0.5">{file.name}</h4>
              <p className="text-xs text-blue-700">Tài liệu soạn thảo Microsoft Word ({file.size})</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs text-slate-600 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Icon name="info" size={13} className="text-blue-600" />
                <span>Thông tin tệp Word:</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-0">
                Hệ thống hỗ trợ lưu trữ và chuyển giao tài liệu nguyên bản đến giáo viên bộ môn.
                Thầy cô sẽ đọc và nhận xét chi tiết trên tệp Word khi chấm bài.
              </p>
            </div>
          </div>
        )}

        {/* EXCEL PREVIEW */}
        {file.type === "excel" && (
          <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 font-bold text-xl">
              X
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-0.5">{file.name}</h4>
              <p className="text-xs text-emerald-700">Bảng tính Microsoft Excel / CSV ({file.size})</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-100 text-xs text-slate-600 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Icon name="info" size={13} className="text-emerald-600" />
                <span>Thông tin bảng tính:</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-0">
                Tệp bảng số liệu thống kê, công thức tính toán và biểu đồ đã được đính kèm chuẩn xác.
              </p>
            </div>
          </div>
        )}

        {/* PDF PREVIEW */}
        {file.type === "pdf" && (
          <div className="rounded-xl overflow-hidden border border-[#f0f0f0] bg-slate-100 shadow-inner">
            <PdfViewer
              fileUrl={file.previewUrl || file.url || "/sample-notice.pdf"}
              className="h-[68vh] w-full"
            />
          </div>
        )}

        {/* ARCHIVE / OTHER */}
        {(file.type === "archive" || file.type === "other") && (
          <div className="p-6 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-700 text-white flex items-center justify-center mx-auto shadow-md">
              <Icon name="file-archive" size={28} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-0.5">{file.name}</h4>
              <p className="text-xs text-slate-500">Tệp nén dữ liệu học tập ({file.size})</p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          {file.previewUrl && (
            <a
              href={file.previewUrl}
              download={file.name}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#f0f0f0] rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Icon name="download" size={13} className="mr-1.5" />
              Tải xuống tệp
            </a>
          )}
          <Button variant="primary" onClick={onClose}>
            Đóng xem trước
          </Button>
        </div>
      </div>
    </Modal>
  );
};
