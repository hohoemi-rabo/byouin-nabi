/**
 * AI関連の型定義（Phase 2）
 * Gemini API レスポンス・緊急度判定に対応
 */

export type UrgencyLevel = 'emergency' | 'soon' | 'watch';

export interface AIRecommendResponse {
  urgency: UrgencyLevel;
  urgency_reason: string;
  recommended_departments: string[];
  department_reason: string;
  advice: string;
  disclaimer: string;
}

export interface FollowUpQuestion {
  id: string;
  text: string;
  type: 'select' | 'text';
  options?: string[];
}

export interface FollowUpAnswer {
  question_id: string;
  question_text: string;
  answer: string;
}

export interface AIRecommendRequest {
  questionnaire: {
    location: string[];
    duration: string | null;
    symptoms: string[];
    lumpSize?: string | null;
    conditions: string[];
    medicine: string | null;
    memo: string;
  };
  age_group?: string;
  area?: string;
}
