'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingBox from '@/components/Common/LoadingBox';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export default function AuthGuard({ children, requireProfile = false }: AuthGuardProps) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (requireProfile && !profile) {
      router.push('/mypage/profile');
    }
  }, [user, profile, isLoading, requireProfile, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingBox message="読み込み中..." size="lg" />
      </div>
    );
  }

  if (!user) return null;
  if (requireProfile && !profile) return null;

  return <>{children}</>;
}
