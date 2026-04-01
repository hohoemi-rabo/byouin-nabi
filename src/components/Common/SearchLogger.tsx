'use client';

import { useEffect, useRef } from 'react';

interface SearchLoggerProps {
  logType: 'symptom' | 'search' | 'outing' | 'route';
  searchData: Record<string, unknown>;
  area?: string;
}

export default function SearchLogger({ logType, searchData, area }: SearchLoggerProps) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_type: logType, search_data: searchData, area }),
    }).catch(() => {});
  }, [logType, searchData, area]);

  return null;
}
