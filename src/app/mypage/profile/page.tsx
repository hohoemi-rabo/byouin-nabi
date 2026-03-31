'use client';

import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/Auth/AuthGuard';
import ProfileForm from '@/components/User/ProfileForm';

function ProfileContent() {
  const { profile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">プロフィール設定</h1>
        <p className="text-base text-gray-600 mb-8">
          あなたの情報を入力すると、より適切な病院や交通手段をおすすめできます
        </p>
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
