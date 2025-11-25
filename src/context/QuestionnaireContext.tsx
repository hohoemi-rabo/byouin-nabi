'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { QuestionnaireData } from '@/types/questionnaire';

interface QuestionnaireContextType {
  data: QuestionnaireData;
  isLoaded: boolean;
  updateLocation: (locations: string[]) => void;
  updateDuration: (duration: string) => void;
  updateSymptoms: (symptoms: string[]) => void;
  updateLumpSize: (size: string | null) => void;
  updateConditions: (conditions: string[]) => void;
  updateMedicine: (medicine: string) => void;
  updateMemo: (memo: string) => void;
  resetData: () => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | null>(null);

const STORAGE_KEY = 'byouin-nabi-questionnaire-data';

const initialData: QuestionnaireData = {
  location: [],
  duration: null,
  symptoms: [],
  lumpSize: null,
  conditions: [],
  medicine: null,
  memo: '',
};

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<QuestionnaireData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // LocalStorageからデータを読み込む（初回マウント時のみ）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setData(parsedData);
      }
    } catch (error) {
      console.error('Failed to load questionnaire data:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // データが変更されたらLocalStorageに保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save questionnaire data:', error);
      }
    }
  }, [data, isLoaded]);

  const updateLocation = (locations: string[]) => {
    setData(prev => ({ ...prev, location: locations }));
  };

  const updateDuration = (duration: string) => {
    setData(prev => ({ ...prev, duration }));
  };

  const updateSymptoms = (symptoms: string[]) => {
    setData(prev => ({ ...prev, symptoms }));
  };

  const updateLumpSize = (size: string | null) => {
    setData(prev => ({ ...prev, lumpSize: size }));
  };

  const updateConditions = (conditions: string[]) => {
    setData(prev => ({ ...prev, conditions }));
  };

  const updateMedicine = (medicine: string) => {
    setData(prev => ({ ...prev, medicine }));
  };

  const updateMemo = (memo: string) => {
    setData(prev => ({ ...prev, memo }));
  };

  const resetData = () => {
    setData(initialData);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear questionnaire data:', error);
    }
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        data,
        isLoaded,
        updateLocation,
        updateDuration,
        updateSymptoms,
        updateLumpSize,
        updateConditions,
        updateMedicine,
        updateMemo,
        resetData,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  }
  return context;
}
