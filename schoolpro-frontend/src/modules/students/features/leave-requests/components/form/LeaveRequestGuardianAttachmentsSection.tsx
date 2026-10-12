import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Upload } from "@/components/ui/Upload";
import type { LeaveRequestAttachment } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestGuardianAttachmentsSectionProps {
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  attachments: LeaveRequestAttachment[];
  onGuardianNameChange: (val: string) => void;
  onGuardianPhoneChange: (val: string) => void;
  onGuardianRelationshipChange: (val: string) => void;
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (index: number) => void;
}

export const LeaveRequestGuardianAttachmentsSection: React.FC<
  LeaveRequestGuardianAttachmentsSectionProps
> = ({
  guardianName,
  guardianPhone,
  guardianRelationship,
  attachments,
  onGuardianNameChange,
  onGuardianPhoneChange,
  onGuardianRelationshipChange,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const { t } = useTranslation(["input", "button"]);

  return (
    <>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Icon name="users" size={14} className="text-blue-600" />
          <span>{t("input:leaveRequests.guardianSectionTitle")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="leave-request-guardian-name"
              className="text-[11px] font-semibold text-slate-500 block mb-1"
            >
              {t("input:leaveRequests.guardianNameLabel")}
            </label>
            <Input
              id="leave-request-guardian-name"
              name="guardianName"
              autoComplete="name"
              value={guardianName}
              onChange={(e) => onGuardianNameChange(e.target.value)}
              placeholder={t("input:leaveRequests.guardianNamePlaceholder")}
            />
          </div>
          <div>
            <label
              htmlFor="leave-request-guardian-phone"
              className="text-[11px] font-semibold text-slate-500 block mb-1"
            >
              {t("input:leaveRequests.guardianPhoneLabel")}
            </label>
            <Input
              id="leave-request-guardian-phone"
              name="guardianPhone"
              autoComplete="tel"
              value={guardianPhone}
              onChange={(e) => onGuardianPhoneChange(e.target.value)}
              placeholder={t("input:leaveRequests.guardianPhonePlaceholder")}
            />
          </div>
          <div>
            <label
              htmlFor="leave-request-guardian-relationship"
              className="text-[11px] font-semibold text-slate-500 block mb-1"
            >
              {t("input:leaveRequests.guardianRelationshipLabel")}
            </label>
            <Select
              id="leave-request-guardian-relationship"
              value={guardianRelationship}
              onChange={(val: string) => onGuardianRelationshipChange(val)}
              className="w-full"
              options={[
                {
                  label: t("input:leaveRequests.relationshipFather"),
                  value: t("input:leaveRequests.relationshipFather"),
                },
                {
                  label: t("input:leaveRequests.relationshipMother"),
                  value: t("input:leaveRequests.relationshipMother"),
                },
                {
                  label: t("input:leaveRequests.relationshipGrandparent"),
                  value: t("input:leaveRequests.relationshipGrandparent"),
                },
                {
                  label: t("input:leaveRequests.relationshipGuardian"),
                  value: t("input:leaveRequests.relationshipGuardian"),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="leave-request-attachments"
          className="text-xs font-bold text-slate-700 block"
        >
          {t("input:leaveRequests.attachmentLabel")}
        </label>

        <Upload.Dragger
          id="leave-request-attachments"
          name="attachments"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          showUploadList={false}
          beforeUpload={(file) => {
            onAddAttachment(file);
            return false;
          }}
          className="rounded-xl"
        >
          <div className="py-2 flex flex-col items-center justify-center gap-1">
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Icon name="upload" size={18} />
            </span>
            <p className="text-xs font-semibold text-slate-700 mb-0">
              {t("input:leaveRequests.attachmentDropzoneTitle")}
            </p>
            <p className="text-[11px] text-slate-400 mb-0">
              {t("input:leaveRequests.attachmentDropzoneHint")}
            </p>
          </div>
        </Upload.Dragger>

        {attachments.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {attachments.map((att, idx) => (
              <div
                key={att.id || idx}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="paperclip" size={13} className="text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-700 truncate">{att.name}</span>
                  {att.size && <span className="text-slate-400 text-[11px]">({att.size})</span>}
                </div>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => onRemoveAttachment(idx)}
                >
                  <Icon name="delete" size={12} />
                  <span>{t("button:delete")}</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
