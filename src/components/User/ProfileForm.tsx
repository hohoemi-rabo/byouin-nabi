'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_CITIES } from '@/lib/masterData';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Common/Button';
import type { Profile } from '@/types/user';

interface ProfileFormProps {
  profile?: Profile | null;
}

const AGE_OPTIONS = [
  { value: 'under39', label: '〜39歳' },
  { value: '40to64', label: '40〜64歳' },
  { value: '65to74', label: '65〜74歳' },
  { value: 'over75', label: '75歳以上' },
];

const MOBILITY_OPTIONS = [
  { value: 'none', label: 'なし' },
  { value: 'cane', label: '杖' },
  { value: 'wheelchair', label: '車椅子' },
];

const FONT_OPTIONS = [
  { value: 'medium', label: '標準' },
  { value: 'large', label: '大' },
  { value: 'xlarge', label: '特大' },
];

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data = {
      display_name: formData.get('display_name') as string,
      age_group: formData.get('age_group') as string,
      area: formData.get('area') as string,
      has_car: formData.get('has_car') === 'on',
      mobility_aid: formData.get('mobility_aid') as string || 'none',
      font_size: formData.get('font_size') as string || 'medium',
    };

    if (!data.display_name || !data.age_group || !data.area) {
      setError('表示名、年齢層、居住地区は必須です。');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'プロフィールの保存に失敗しました');
      }

      router.push('/mypage');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="display_name" className="block text-base font-bold mb-2">
          表示名 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          defaultValue={profile?.display_name || ''}
          required
          placeholder="例: 田中太郎"
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-base font-bold mb-2">
          年齢層 <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AGE_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
              <input
                type="radio"
                name="age_group"
                value={opt.value}
                defaultChecked={profile?.age_group === opt.value}
                required
                className="w-5 h-5"
              />
              <span className="text-base">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="area" className="block text-base font-bold mb-2">
          居住地区 <span className="text-error">*</span>
        </label>
        <select
          id="area"
          name="area"
          defaultValue={profile?.area || ''}
          required
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none"
        >
          <option value="">選んでください</option>
          {ALL_CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
          <input
            type="checkbox"
            name="has_car"
            defaultChecked={profile?.has_car}
            className="w-5 h-5"
          />
          <span className="text-base">自家用車を持っている</span>
        </label>
      </div>

      <div>
        <label className="block text-base font-bold mb-2">移動補助</label>
        <div className="flex gap-3">
          {MOBILITY_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
              <input
                type="radio"
                name="mobility_aid"
                value={opt.value}
                defaultChecked={(profile?.mobility_aid || 'none') === opt.value}
                className="w-5 h-5"
              />
              <span className="text-base">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-bold mb-2">文字サイズ</label>
        <div className="flex gap-3">
          {FONT_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
              <input
                type="radio"
                name="font_size"
                value={opt.value}
                defaultChecked={(profile?.font_size || 'medium') === opt.value}
                className="w-5 h-5"
              />
              <span className="text-base">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={loading} className="w-full text-lg py-4">
        {loading ? '保存中...' : '保存する'}
      </Button>
    </form>
  );
}
