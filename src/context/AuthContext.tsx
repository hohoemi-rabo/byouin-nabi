'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    // 初回ロード（getSession でローカルキャッシュから取得 — ロック競合を回避）
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setProfile(data as Profile | null);
        }
      } catch {
        // 未ログイン状態
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Auth 状態変更の監視（非同期処理はブロックしない）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (!currentUser || event === 'SIGNED_OUT') {
          setProfile(null);
          return;
        }

        // プロフィール取得は非同期で実行（リスナーをブロックしない）
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
          .then(({ data }) => {
            setProfile(data as Profile | null);
          });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    // state更新せず即リダイレクト（ちらつき防止）
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
