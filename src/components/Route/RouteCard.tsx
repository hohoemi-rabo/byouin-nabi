import type { Route } from '@/types/route';

const ROUTE_ICONS: Record<string, string> = {
  driving: '🚗',
  transit: '🚌',
  demand: '🚐',
  taxi: '🚕',
  walking: '🚶',
  shuttle: '🏥',
};

const ROUTE_LABELS: Record<string, string> = {
  driving: '自家用車',
  transit: '公共交通機関',
  demand: 'デマンド交通',
  taxi: 'タクシー',
  walking: '徒歩',
  shuttle: '送迎バス',
};

interface RouteCardProps {
  route: Route;
  index: number;
}

export default function RouteCard({ route, index }: RouteCardProps) {
  const icon = ROUTE_ICONS[route.type] || '🚗';
  const label = route.transport_name || ROUTE_LABELS[route.type] || route.type;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">ルート {index + 1}</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {ROUTE_LABELS[route.type]}
            </span>
          </div>
          <h3 className="text-lg font-bold mt-1">{label}</h3>
        </div>
      </div>

      {/* 所要時間・距離 */}
      {(route.duration_minutes > 0 || route.distance_km > 0) && (
        <div className="flex gap-4 mb-4 text-base">
          {route.duration_minutes > 0 && (
            <span className="font-medium">⏱ 約{route.duration_minutes}分</span>
          )}
          {route.distance_km > 0 && (
            <span className="text-gray-600">📏 {route.distance_km}km</span>
          )}
        </div>
      )}

      {/* 料金 */}
      {route.fare && (
        <p className="text-base mb-3">💰 {route.fare}</p>
      )}

      {/* 手順 */}
      {route.steps.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <ul className="space-y-1 text-sm text-gray-700">
            {route.steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-gray-400 font-mono">{i + 1}.</span>
                <span>{step.instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 注意事項 */}
      {route.notes && (
        <p className="text-sm text-orange bg-orange/10 rounded-lg p-3 mb-4">
          ⚠️ {route.notes}
        </p>
      )}

      {/* 予約・アクションボタン */}
      <div className="flex gap-2 flex-wrap">
        {route.booking_required && route.booking_phone && (
          <a href={`tel:${route.booking_phone}`}
            className="flex items-center justify-center gap-2 bg-success text-white px-6 rounded-lg hover:bg-success/90 transition-colors font-bold text-lg shadow-md"
            style={{ minHeight: '56px' }}>
            📞 電話で予約
          </a>
        )}
        {route.booking_url && (
          <a href={route.booking_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 rounded-lg hover:bg-primary/90 transition-colors font-medium text-base min-h-tap shadow-md">
            🌐 Web予約
          </a>
        )}
        {route.map_url && (
          <a href={route.map_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-orange text-white px-6 rounded-lg hover:bg-orange/90 transition-colors font-medium text-base min-h-tap shadow-md">
            🗺️ Google Maps で開く
          </a>
        )}
      </div>
    </div>
  );
}
