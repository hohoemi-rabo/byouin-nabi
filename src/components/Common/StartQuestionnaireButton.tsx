'use client';

import { useRouter } from 'next/navigation';
import Button from './Button';

interface StartQuestionnaireButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function StartQuestionnaireButton({
  className,
  children
}: StartQuestionnaireButtonProps) {
  const router = useRouter();

  const handleStart = () => {
    // LocalStorageのアンケートデータをクリア
    try {
      localStorage.removeItem('byouin-nabi-questionnaire-data');
    } catch (error) {
      console.error('Failed to clear questionnaire data:', error);
    }

    // アンケートページに遷移
    router.push('/questionnaire');
  };

  return (
    <Button
      variant="primary"
      onClick={handleStart}
      className={className}
    >
      {children}
    </Button>
  );
}
