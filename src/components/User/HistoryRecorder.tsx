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
