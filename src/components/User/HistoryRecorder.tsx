'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface HistoryRecorderProps {
  hospitalId: string;
  searchType?: string;
}

export default function HistoryRecorder({ hospitalId, searchType = 'search' }: HistoryRecorderProps) {
  const { user } = useAuth();
  const recorded = useRef(false);

  useEffect(() => {
    if (!user || recorded.current) return;
    recorded.current = true;

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
