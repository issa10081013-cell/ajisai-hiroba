"use client";
import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/platform";

/** Capacitorネイティブアプリ内で動作しているかを返すフック（クライアント専用） */
export function useIsNativeApp(): boolean {
  // 初期描画でブリッジを同期判定し、iOSアプリでの「一瞬表示されてから消える」チラつきを防ぐ。
  const [native, setNative] = useState<boolean>(() => isNativeApp());
  useEffect(() => {
    setNative(isNativeApp());
  }, []);
  return native;
}

/**
 * 子要素をネイティブアプリ（iOS/Android）では描画しないラッパー。
 * App Storeガイドライン3.1.1対策で、あじさい会員（月額サブスク）の購入導線を
 * アプリ内から隠す用途で使う。Web/ブラウザでは従来どおり表示する。
 */
export default function HideOnNativeApp({ children }: { children: React.ReactNode }) {
  const native = useIsNativeApp();
  if (native) return null;
  return <>{children}</>;
}
