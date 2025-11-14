import { CapacitorConfig } from '@capacitor/cli';

// capacitor.config.ts 側でもビルドモード毎に設定の分岐が可能、利用する場合は以下でdotenv を importした上で利用する
// import * as dotenv from 'dotenv';

// モード取得
// console.log('capacitor.config.ts loaded with NODE_ENV:', process.env.NODE_ENV);
// モード毎に設定された値を.envから取得することも可能
// console.log('App ID:', process.env.VITE_APP_ID);
// console.log('App Name:', process.env.VITE_APP_NAME);

const config: CapacitorConfig = {
  // appId、appNameは各プラットフォーム側で上書きされるが、便宜的に値を設置しておく
  appId: 'app.company.project',
  appName: 'MyAppNameDevelop',
  webDir: 'dist',
  plugins: {
  },
  android: {
  }
}

export default config;
