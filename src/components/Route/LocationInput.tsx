'use client';

import { useState } from 'react';
import { ALL_CITIES } from '@/lib/masterData';
import Button from '@/components/Common/Button';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

interface LocationInputProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

export default function LocationInput({ onLocationSelect }: LocationInputProps) {
  const [mode, setMode] = useState<'gps' | 'address' | 'city'>('gps');
  const [address, setAddress] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError('お使いのブラウザはGPSに対応していません');
      setMode('address');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSelect({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('位置情報を取得できませんでした。住所を入力してください。');
        setMode('address');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleAddress = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLocationSelect({ lat: data.latitude, lng: data.longitude });
    } catch (err) {
      setError(err instanceof Error ? err.message : '住所から座標を取得できませんでした');
    } finally {
      setLoading(false);
    }
  };

  const handleCity = async () => {
    if (!selectedCity) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(selectedCity + ' 役場')}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLocationSelect({ lat: data.latitude, lng: data.longitude });
    } catch (err) {
      setError(err instanceof Error ? err.message : '地区の座標を取得できませんでした');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
      <h3 className="text-lg font-bold mb-4">📍 出発地を入力</h3>

      {/* モード切替 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'gps' as const, label: '📡 現在地' },
          { key: 'address' as const, label: '✏️ 住所入力' },
          { key: 'city' as const, label: '🏘️ 地区選択' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setMode(key); setError(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-tap ${
              mode === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {mode === 'gps' && (
        <Button variant="primary" onClick={handleGPS} disabled={loading} className="w-full text-lg py-4">
          {loading ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />取得中...</span> : '📡 現在地を使う'}
        </Button>
      )}

      {mode === 'address' && (
        <div className="space-y-3">
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="例: 長野県飯田市○○町1-2-3"
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:border-primary focus:outline-none" />
          <Button variant="primary" onClick={handleAddress} disabled={loading || !address.trim()} className="w-full text-lg py-4">
            {loading ? '検索中...' : '住所で検索'}
          </Button>
        </div>
      )}

      {mode === 'city' && (
        <div className="space-y-3">
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:border-primary focus:outline-none">
            <option value="">地区を選んでください</option>
            {ALL_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <Button variant="primary" onClick={handleCity} disabled={loading || !selectedCity} className="w-full text-lg py-4">
            {loading ? '検索中...' : 'この地区から検索'}
          </Button>
        </div>
      )}
    </div>
  );
}
