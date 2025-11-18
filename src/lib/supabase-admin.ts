import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Supabase環境変数が設定されていません。' +
    'NEXT_PUBLIC_SUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを.env.localに設定してください。'
  );
}

/**
 * 管理者操作用のSupabaseクライアント
 *
 * サービスロールキーを使用しているため、RLSポリシーをバイパスします。
 * このクライアントはServer Actions内でのみ使用し、クライアント側には公開しないでください。
 *
 * @warning 非常に強力な権限を持つため、使用には十分注意してください
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
