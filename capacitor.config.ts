import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'jp.ajisai.hiroba',
  appName: 'あじさい体験ひろば',
  webDir: 'public',
  // あじさい広場はサーバー型(Next.js)のため、アプリの皮から本番サイトを表示する
  server: {
    url: 'https://ajisai-hiroba.vercel.app',
    cleartext: false,
  },
  ios: {
    // ステータスバーと被らないように内側に寄せる
    contentInset: 'always',
    backgroundColor: '#F5F3FA',
  },
};

export default config;
