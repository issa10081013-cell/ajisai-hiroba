// 体験データの location は「福岡市城南区」のようなエリアテキスト（正確住所は予約後に非公開）。
// ジオコーディングAPIを使わず、区・市名から代表座標を引く静的テーブルでピンを置く。

export type LatLng = { lat: number; lng: number };

// 福岡県内の地図デフォルト中心（福岡市中央区あたり）
export const FUKUOKA_CENTER: LatLng = { lat: 33.585, lng: 130.39 };

// 注意: 部分一致で判定するため、より具体的な名前（城南区）を短い名前（南区）より先に並べる。
const AREA_COORDS: { keyword: string; coord: LatLng }[] = [
  // 福岡市
  { keyword: "城南区", coord: { lat: 33.57, lng: 130.36 } },
  { keyword: "早良区", coord: { lat: 33.55, lng: 130.34 } },
  { keyword: "中央区", coord: { lat: 33.585, lng: 130.39 } },
  { keyword: "博多区", coord: { lat: 33.59, lng: 130.42 } },
  { keyword: "東区", coord: { lat: 33.65, lng: 130.42 } },
  { keyword: "西区", coord: { lat: 33.58, lng: 130.30 } },
  { keyword: "南区", coord: { lat: 33.56, lng: 130.42 } },
  // 北九州市
  { keyword: "門司区", coord: { lat: 33.94, lng: 130.96 } },
  { keyword: "小倉北区", coord: { lat: 33.88, lng: 130.88 } },
  { keyword: "小倉南区", coord: { lat: 33.82, lng: 130.90 } },
  { keyword: "若松区", coord: { lat: 33.90, lng: 130.76 } },
  { keyword: "八幡東区", coord: { lat: 33.86, lng: 130.81 } },
  { keyword: "八幡西区", coord: { lat: 33.86, lng: 130.75 } },
  { keyword: "戸畑区", coord: { lat: 33.89, lng: 130.83 } },
  // 周辺市
  { keyword: "糸島", coord: { lat: 33.56, lng: 130.20 } },
  { keyword: "春日市", coord: { lat: 33.53, lng: 130.47 } },
  { keyword: "大野城", coord: { lat: 33.53, lng: 130.48 } },
];

// 文字列から決定論的に小さなオフセットを作る（同じ区の体験が重ならないように）。
function jitterFromId(id: string): LatLng {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  // ±約0.012度（≒1.3km）に収める
  const dx = (((h % 1000) / 1000) - 0.5) * 0.024;
  const dy = ((((h >> 10) % 1000) / 1000) - 0.5) * 0.024;
  return { lat: dy, lng: dx };
}

// location 文字列＋id から地図ピンの座標を返す。区が判定できなければ福岡市中央区を中心にする。
export function resolveCoord(location: string, id: string): LatLng {
  const match = AREA_COORDS.find((a) => location.includes(a.keyword));
  const base = match ? match.coord : FUKUOKA_CENTER;
  const j = jitterFromId(id);
  return { lat: base.lat + j.lat, lng: base.lng + j.lng };
}
