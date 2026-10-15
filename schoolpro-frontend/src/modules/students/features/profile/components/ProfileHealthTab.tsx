import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { StudentHealthRecord } from "@/modules/students/features/profile/types";

interface ProfileHealthTabProps {
  healthRecord: StudentHealthRecord;
}

export const ProfileHealthTab: React.FC<ProfileHealthTabProps> = ({
  healthRecord,
}) => {
  const { t } = useTranslation(["card", "input"]);

  // Calculate BMI: weight / (height / 100)^2
  const heightM = healthRecord.heightCm / 100;
  const bmi = heightM > 0 ? (healthRecord.weightKg / (heightM * heightM)).toFixed(1) : "0";
  const numBmi = parseFloat(bmi);

  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { text: "Thiếu cân nhẹ", color: "orange" };
    if (val <= 24.9) return { text: "Thể trạng Cân đối", color: "green" };
    return { text: "Thừa cân nhẹ", color: "red" };
  };

  const bmiStatus = getBmiStatus(numBmi);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="heart" size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
              {t("card:profile.sections.health")}
            </h2>
            <Tag color="cyan" className="font-bold text-xs px-2.5 py-0.5 m-0">
              BHYT: {healthRecord.insuranceCode}
            </Tag>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("card:profile.sections.healthDesc")}
          </p>
        </div>
      </div>

      {/* Physical stats section */}
      <div className="rounded-xl border border-[#f0f0f0] p-5 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-[#f0f0f0]/60">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-0.5">
              Chỉ số thể chất & Sức khỏe định kỳ
            </h3>
            <p className="text-xs text-slate-500 mb-0">
              Lần khám gần nhất: <strong>{healthRecord.lastCheckupAt}</strong> tại Phòng Y tế học đường
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 bg-white border border-[#f0f0f0] rounded-xl space-y-1 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Chiều cao</span>
            <p className="text-lg sm:text-xl font-extrabold text-blue-700 mb-0">
              {healthRecord.heightCm} <span className="text-xs font-semibold text-slate-500">cm</span>
            </p>
          </div>

          <div className="p-3.5 bg-white border border-[#f0f0f0] rounded-xl space-y-1 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Cân nặng</span>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mb-0">
              {healthRecord.weightKg} <span className="text-xs font-semibold text-slate-500">kg</span>
            </p>
          </div>

          <div className="p-3.5 bg-white border border-[#f0f0f0] rounded-xl space-y-1 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Chỉ số BMI</span>
            <div className="flex items-center gap-2">
              <p className="text-lg sm:text-xl font-extrabold text-purple-700 mb-0">
                {bmi}
              </p>
              <Tag color={bmiStatus.color} className="text-[10px] m-0 font-bold">
                {bmiStatus.text}
              </Tag>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-[#f0f0f0] rounded-xl space-y-1 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Nhóm máu</span>
            <p className="text-lg sm:text-xl font-extrabold text-rose-700 mb-0">
              {healthRecord.bloodType}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical details section */}
      <div className="rounded-xl border border-[#f0f0f0] p-5 bg-white space-y-4">
        <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Icon name="checkCircle" size={15} className="text-blue-600" />
          <span>Hồ sơ bệnh án & Lưu ý lâm sàng</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.vision")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              Trái: {healthRecord.visionLeft} • Phải: {healthRecord.visionRight}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.insuranceCode")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              {healthRecord.insuranceCode}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.allergies")}</span>
            <p className="font-medium text-slate-700 mb-0 leading-relaxed">
              {healthRecord.allergies}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.chronicIllness")}</span>
            <p className="font-medium text-slate-700 mb-0 leading-relaxed">
              {healthRecord.chronicIllness}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl text-xs space-y-1">
          <span className="text-slate-400 font-medium">{t("input:labels.healthNotes")}</span>
          <p className="font-medium text-slate-700 mb-0 leading-relaxed">
            {healthRecord.notes}
          </p>
        </div>
      </div>
    </div>
  );
};
