import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Upload } from "@/components/ui/Upload";
import { message } from "@/components/ui/Message";
import { PRESET_AVATARS } from "@/modules/students/features/profile/services/mockProfileData";

interface AvatarUploadModalProps {
  isOpen: boolean;
  currentAvatarUrl: string;
  onClose: () => void;
  onSelectAvatar: (url: string) => Promise<void>;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  currentAvatarUrl,
  onClose,
  onSelectAvatar,
}) => {
  const { t } = useTranslation(["modal", "button", "message"]);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentAvatarUrl);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCustomUpload = (file: File) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
    if (!isJpgOrPng) {
      message.error(t("message:error"));
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(t("message:error"));
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    return false; // prevent default upload POST request
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSelectAvatar(selectedUrl);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={t("modal:avatarModalTitle")}
      footer={null}
      width={520}
      centered
    >
      <div className="space-y-6 pt-2">
        <p className="text-xs text-slate-500 mb-0">
          {t("modal:avatarModalDesc")}
        </p>

        {/* Current Preview */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <Avatar
            size={88}
            src={selectedUrl}
            className="ring-4 ring-blue-500/20 shadow-md"
          />
          <span className="text-xs text-slate-400 font-medium">
            Preview
          </span>
        </div>

        {/* Preset list */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-0">
            <Icon name="user" size={14} className="text-blue-600" />
            <span>{t("modal:choosePresetAvatar")}</span>
          </h4>
          <div className="grid grid-cols-6 gap-2.5">
            {PRESET_AVATARS.map((url, idx) => {
              const isSelected = selectedUrl === url;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedUrl(url)}
                  className={`p-1 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 scale-105 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <Avatar size={48} src={url} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom file upload */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-0">
            <Icon name="upload" size={14} className="text-blue-600" />
            <span>{t("modal:uploadCustomAvatar")}</span>
          </h4>
          <Upload.Dragger
            accept="image/png, image/jpeg, image/webp"
            showUploadList={false}
            beforeUpload={handleCustomUpload}
            className="p-4! border-dashed! border-slate-300! hover:border-blue-500! rounded-xl!"
          >
            <div className="flex flex-col items-center justify-center text-slate-500 py-1">
              <Icon name="upload" size={24} className="text-blue-500 mb-2" />
              <p className="text-xs font-medium text-slate-700 mb-0.5">
                Kéo thả ảnh hoặc bấm để chọn tệp từ máy
              </p>
              <p className="text-[11px] text-slate-400 mb-0">
                Định dạng PNG, JPG, WEBP dung lượng tối đa 2MB
              </p>
            </div>
          </Upload.Dragger>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("button:cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            <Icon
              name={isSubmitting ? "loading" : "check"}
              size={14}
              className={isSubmitting ? "animate-spin" : ""}
            />
            {t("button:save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
