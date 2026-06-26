// 実行環境の判定ユーティリティ。
// あじさい広場アプリはCapacitorの「皮」から本番サイト(server.url)を読み込むため、
// アプリ(iOS/Android)で開かれている場合は window.Capacitor のブリッジが注入される。
// App Storeガイドライン3.1.1（デジタル課金はApple IAP必須）を避けるため、
// ネイティブアプリ時はあじさい会員（月額サブスク）の購入導線を表示しない。

type CapacitorBridge = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  isNative?: boolean;
};

/** Capacitorネイティブアプリ（iOS/Android）内で動作しているか */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: CapacitorBridge }).Capacitor;
  if (!cap) return false;
  if (typeof cap.isNativePlatform === "function") return cap.isNativePlatform();
  return cap.isNative === true;
}

/** iOSアプリ内で動作しているか（3.1.1対策で特にiOSを厳格に隠す用途） */
export function isIOSApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: CapacitorBridge }).Capacitor;
  if (!cap) return false;
  const native = typeof cap.isNativePlatform === "function" ? cap.isNativePlatform() : cap.isNative === true;
  const platform = typeof cap.getPlatform === "function" ? cap.getPlatform() : "";
  return native && platform === "ios";
}
