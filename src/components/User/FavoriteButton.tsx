'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface FavoriteButtonProps {
  hospitalId: string;
}

export default function FavoriteButton({ hospitalId }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkFavorite = async () => {
      const res = await fetch('/api/user/favorites');
      if (res.ok) {
        const data = await res.json();
        const found = data.favorites?.some(
          (f: { hospital_id: string }) => f.hospital_id === hospitalId
        );
        setIsFavorite(found);
      }
    };

    checkFavorite();
  }, [user, hospitalId]);

  if (!user) return null;

  const handleToggle = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (isFavorite) {
        const res = await fetch('/api/user/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hospital_id: hospitalId }),
        });
        if (res.ok) {
          setIsFavorite(false);
          setMessage('かかりつけ医を解除しました');
        }
      } else {
        const res = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hospital_id: hospitalId }),
        });
        if (res.ok) {
          setIsFavorite(true);
          setMessage('かかりつけ医に登録しました');
        } else {
          const data = await res.json();
          setMessage(data.error || '登録に失敗しました');
        }
      }
    } catch {
      setMessage('エラーが発生しました');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-lg transition-colors min-h-tap shadow-md ${
          isFavorite
            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400 hover:bg-yellow-200'
            : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
        } disabled:opacity-50`}
      >
        {isFavorite ? '⭐ かかりつけ医に登録済み' : '☆ かかりつけ医に登録'}
      </button>
      {message && (
        <p className="text-sm text-center mt-2 text-gray-600">{message}</p>
      )}
    </div>
  );
}
