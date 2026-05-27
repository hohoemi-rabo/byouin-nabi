'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Common/Button';
import {
  type EmergencyRotation,
  type RotationType,
  ROTATION_TYPE_OPTIONS,
  ROTATION_DEPARTMENT_OPTIONS,
} from '@/types/emergency-rotation';

interface HospitalOption {
  id: string;
  name: string;
}

interface Props {
  rotation?: EmergencyRotation;
  hospitals: HospitalOption[];
  action: (formData: FormData) => Promise<void>;
  mode: 'create' | 'edit';
}

const NO_DEPT_TYPES: RotationType[] = ['duty_pharmacy', 'night_emergency'];

export default function EmergencyRotationForm({ rotation, hospitals, action, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rotationType, setRotationType] = useState<RotationType>(rotation?.rotation_type ?? 'duty_doctor');
  const [facilityName, setFacilityName] = useState<string>(rotation?.facility_name ?? '');
  const [phone, setPhone] = useState<string>(rotation?.phone ?? '');
  const [hospitalId, setHospitalId] = useState<string>(rotation?.hospital_id ?? '');

  const departmentDisabled = NO_DEPT_TYPES.includes(rotationType);

  const handleHospitalChange = (id: string) => {
    setHospitalId(id);
    if (id) {
      const selected = hospitals.find((h) => h.id === id);
      if (selected) {
        setFacilityName(selected.name);
        // 電話は hospitals マスタから自動入力したいが、ここでは listing で持っていないので touch しない
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await action(formData);
        // Server Action が redirect するためここには到達しない
      } catch (err) {
        console.error('Form submit error:', err);
        setError(err instanceof Error ? err.message : '保存に失敗しました');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="bg-error/10 border-2 border-error rounded-lg p-3">
          <p className="text-error font-bold text-sm">❌ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="duty_date" className="block text-sm font-medium mb-1">
            当番日 <span className="text-error">*</span>
          </label>
          <input
            type="date"
            id="duty_date"
            name="duty_date"
            defaultValue={rotation?.duty_date}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="rotation_type" className="block text-sm font-medium mb-1">
            種別 <span className="text-error">*</span>
          </label>
          <select
            id="rotation_type"
            name="rotation_type"
            value={rotationType}
            onChange={(e) => setRotationType(e.target.value as RotationType)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {ROTATION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="area" className="block text-sm font-medium mb-1">
            地区 <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="area"
            name="area"
            defaultValue={rotation?.area ?? '飯田地区'}
            placeholder="例: 飯田地区 / 阿南地区"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium mb-1">
            診療科
            {!departmentDisabled && <span className="text-error"> *</span>}
          </label>
          <select
            id="department"
            name="department"
            defaultValue={rotation?.department ?? ''}
            disabled={departmentDisabled}
            required={!departmentDisabled}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">選択してください</option>
            {ROTATION_DEPARTMENT_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {departmentDisabled && (
            <p className="text-xs text-gray-500 mt-1">薬局・夜間急患では未使用</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="hospital_id" className="block text-sm font-medium mb-1">
          既存病院との紐付け
        </label>
        <select
          id="hospital_id"
          name="hospital_id"
          value={hospitalId}
          onChange={(e) => handleHospitalChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">紐付けなし（へき地診療所・薬局など）</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-1">
          紐付けると施設名が自動入力されます（編集可）
        </p>
      </div>

      <div>
        <label htmlFor="facility_name" className="block text-sm font-medium mb-1">
          施設名 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="facility_name"
          name="facility_name"
          value={facilityName}
          onChange={(e) => setFacilityName(e.target.value)}
          placeholder="例: 源田内科医院"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          電話番号 <span className="text-error">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="例: 0265-24-1550"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium mb-1">
            開始時刻 <span className="text-error">*</span>
          </label>
          <input
            type="time"
            id="start_time"
            name="start_time"
            defaultValue={rotation?.start_time?.slice(0, 5) ?? '09:00'}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="end_time" className="block text-sm font-medium mb-1">
            終了時刻 <span className="text-error">*</span>
          </label>
          <input
            type="time"
            id="end_time"
            name="end_time"
            defaultValue={rotation?.end_time?.slice(0, 5) ?? '18:00'}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium mb-1">
          備考
        </label>
        <textarea
          id="note"
          name="note"
          defaultValue={rotation?.note ?? ''}
          placeholder="例: 11時までの電話予約者のみ"
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isPending} className="text-sm">
          {isPending ? '保存中...' : mode === 'create' ? '登録' : '更新'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/emergency-rotations')}
          disabled={isPending}
          className="text-sm"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
