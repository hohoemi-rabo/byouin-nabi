import Link from 'next/link';
import Button from '@/components/Common/Button';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Hospital } from '@/types/hospital';

export default async function AdminDashboardPage() {
  const [hospitalsRes, transportRes, facilitiesRes, profilesRes, logsRes] = await Promise.all([
    supabaseAdmin.from('hospitals').select('*').order('name'),
    supabaseAdmin.from('transport_services').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('facilities').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('search_logs').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const hospitalList: Hospital[] = hospitalsRes.data || [];
  const cities = Array.from(new Set(hospitalList.map(h => h.city))).sort();
  const categories = Array.from(new Set(hospitalList.flatMap(h => h.category))).sort();

  const stats = [
    { icon: '🏥', label: '登録病院数', value: hospitalList.length },
    { icon: '📍', label: '対応市町村数', value: cities.length },
    { icon: '🩺', label: '診療科目数', value: categories.length },
    { icon: '🚌', label: '交通サービス数', value: transportRes.count || 0 },
    { icon: '🏪', label: '登録施設数', value: facilitiesRes.count || 0 },
    { icon: '👤', label: '登録ユーザー数', value: profilesRes.count || 0 },
    { icon: '🔍', label: '今月の検索回数', value: logsRes.count || 0 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">ダッシュボード</h1>
        <p className="text-sm text-gray-600">病院ナビ南信 管理システムの概要</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{s.icon}</div>
              <div>
                <p className="text-xs text-gray-600">{s.label}</p>
                <p className="text-2xl font-bold text-primary">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold mb-3">クイックアクション</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/hospitals"><Button variant="primary" className="text-sm">病院管理</Button></Link>
          <Link href="/admin/transport"><Button variant="secondary" className="text-sm">交通手段管理</Button></Link>
          <Link href="/admin/facilities"><Button variant="secondary" className="text-sm">施設管理</Button></Link>
          <Link href="/"><Button variant="secondary" className="text-sm">公開サイト</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cities.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-3">対応市町村</h2>
            <div className="flex flex-wrap gap-2">
              {cities.map(city => (
                <span key={city} className="px-3 py-1 bg-gray-100 rounded text-sm">{city}</span>
              ))}
            </div>
          </div>
        )}
        {categories.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-3">登録診療科目</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <span key={cat} className="px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium">{cat}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
