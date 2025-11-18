'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import type { QuestionnaireData } from '@/types/questionnaire';

interface QuestionnaireContextType {
  data: QuestionnaireData;
  updateLocation: (location: string) => void;
  updateDuration: (duration: string) => void;
  updateSymptoms: (symptoms: string[]) => void;
  updateLumpSize: (size: string | null) => void;
  updateConditions: (conditions: string[]) => void;
  updateMedicine: (medicine: string) => void;
  updateMemo: (memo: string) => void;
  resetData: () => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | null>(null);

const initialData: QuestionnaireData = {
  location: null,
  duration: null,
  symptoms: [],
  lumpSize: null,
  conditions: [],
  medicine: null,
  memo: '',
};

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<QuestionnaireData>(initialData);

  const updateLocation = (location: string) => {
    setData(prev => ({ ...prev, location }));
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
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        data,
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
