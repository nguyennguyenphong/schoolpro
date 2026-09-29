import React, { useState, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { SubmittedFile } from "@/modules/students/features/assignments/types";
import { FILE_CATEGORIES_META } from "@/modules/students/features/assignments/utils/fileUtils";

interface FileItemCardProps {
  file: SubmittedFile;
  onPreview?: (file: SubmittedFile) => void;
  onRemove?: (fileId: string) => void;
  readOnly?: boolean;
}

export const FileItemCard: React.FC<FileItemCardProps> = ({
  file,
  onPreview,
  onRemove,
  readOnly = false,
}) => {
  const meta = FILE_CATEGORIES_META[file.type] || FILE_CATEGORIES_META.other;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        setIsPlayingAudio(false);
      });
    }
  };

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${meta.theme.bg} ${meta.theme.border} hover:shadow-xs`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon or Thumbnail + Info */}
        <div className="flex items-center gap-3 min-w-0">
          {file.type === "image" && file.previewUrl ? (
            <div
              onClick={() => onPreview?.(file)}
              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity bg-white flex items-center justify-center shadow-2xs"
            >
              <img
                src={file.previewUrl}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${meta.theme.iconBg} shadow-2xs`}
            >
              <Icon name={meta.iconName} size={18} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${meta.theme.badgeBg}`}
              >
                {meta.badge}
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {file.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{file.size}</span>
              {file.uploadedAt && (
                <>
                  <span>•</span>
                  <span>{file.uploadedAt}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Audio Play Button */}
          {file.type === "audio" && file.previewUrl && (
            <>
              <audio
                ref={audioRef}
                src={file.previewUrl}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
              <button
                type="button"
                onClick={toggleAudio}
                className="p-1.5 text-xs text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200/80 rounded-lg transition-colors flex items-center gap-1"
                title={isPlayingAudio ? "Tạm dừng" : "Phát thử âm thanh"}
              >
                <Icon name={isPlayingAudio ? "pause" : "play"} size={13} />
                <span className="text-[11px] font-medium hidden sm:inline">
                  {isPlayingAudio ? "Đang phát" : "Nghe thử"}
                </span>
              </button>
            </>
          )}

          {/* Preview Button */}
          {onPreview && (
            <Button
              variant="outline"
              className="bg-white text-slate-700"
              onClick={() => onPreview(file)}
            >
              <Icon name="eye" size={12} />
              <span>Xem trước</span>
            </Button>
          )}

          {/* Remove Button */}
          {!readOnly && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Xóa tệp này"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
