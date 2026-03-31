'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface HistoryRecorderProps {
  hospitalId: string;
  searchType?: string;
}

export default function HistoryRecorder({ hospitalId, searchType = 'search' }: HistoryRecorderProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // セッション内で同じ病院の重複記録を防止
    const key = `history-${hospitalId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    fetch('/api/user/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        search_type: searchType,
        search_params: {},
        result_hospital_id: hospitalId,
      }),
    }).catch(() => {
      // 履歴記録の失敗はサイレントに無視
    });
  }, [user, hospitalId, searchType]);

  return null;
}
