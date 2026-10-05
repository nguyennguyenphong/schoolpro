import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { StudentHealthRecord } from "@/modules/students/features/profile/types";

interface ProfileHealthTabProps {
  healthRecord: StudentHealthRecord;
}

export const ProfileHealthTab: React.FC<ProfileHealthTabProps> = ({
  healthRecord,
}) => {
  const { t } = useTranslation(["input"]);

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
      {/* Physical stats card */}
      <Card className="rounded-2xl border-slate-200 shadow-xs p-6 bg-white space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-0.5">
              Chỉ số thể chất & Sức khỏe định kỳ
            </h3>
            <p className="text-xs text-slate-400 mb-0">
              Lần khám gần nhất: <strong>{healthRecord.lastCheckupAt}</strong> tại Phòng Y tế học đường
            </p>
          </div>
          <Tag color="cyan" className="font-bold text-xs px-2.5 py-0.5">
            BHYT: {healthRecord.insuranceCode}
          </Tag>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-medium">Chiều cao</span>
            <p className="text-xl font-extrabold text-blue-700 mb-0">
              {healthRecord.heightCm} <span className="text-xs font-semibold text-slate-500">cm</span>
            </p>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-medium">Cân nặng</span>
            <p className="text-xl font-extrabold text-emerald-700 mb-0">
              {healthRecord.weightKg} <span className="text-xs font-semibold text-slate-500">kg</span>
            </p>
          </div>

          <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-medium">Chỉ số BMI</span>
            <div className="flex items-center gap-2">
              <p className="text-xl font-extrabold text-purple-700 mb-0">
                {bmi}
              </p>
              <Tag color={bmiStatus.color} className="text-[10px] m-0 font-bold">
                {bmiStatus.text}
              </Tag>
            </div>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-medium">Nhóm máu</span>
            <p className="text-xl font-extrabold text-rose-700 mb-0">
              {healthRecord.bloodType}
            </p>
          </div>
        </div>
      </Card>

      {/* Clinical details card */}
      <Card className="rounded-2xl border-slate-200 shadow-xs p-6 bg-white space-y-4">
        <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Icon name="checkCircle" size={15} className="text-blue-600" />
          <span>Hồ sơ bệnh án & Lưu ý lâm sàng</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.vision")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0">
              Trái: {healthRecord.visionLeft} • Phải: {healthRecord.visionRight}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.insuranceCode")}</span>
            <p className="font-bold text-slate-800 text-sm mb-0 font-mono">
              {healthRecord.insuranceCode}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.allergies")}</span>
            <p className="font-medium text-slate-700 mb-0 leading-relaxed">
              {healthRecord.allergies}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">{t("input:labels.chronicIllness")}</span>
            <p className="font-medium text-slate-700 mb-0 leading-relaxed">
              {healthRecord.chronicIllness}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
          <span className="text-slate-400 font-medium">{t("input:labels.healthNotes")}</span>
          <p className="font-medium text-slate-700 mb-0 leading-relaxed">
            {healthRecord.notes}
          </p>
        </div>
      </Card>
    </div>
  );
};
