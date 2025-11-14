# Capacitor ハイブリッドアプリプロジェクト Shared構成導入サンプル（Android/ios対応）

`Capacitor` を利用したハイブリッドアプリ開発時に、develop / production ビルド及び ios / Android プラットフォームの各環境でソースコード等を共有しつつ、明確にappIdや設定を分けられる構成となっています。（実機に各ビルドのAppを同時にインストールして検証する際に便利）<br>
develop / production 以外に staging 等の環境を追加することも可能。<br>
Vue.jsでの運用を想定していますが、他のフレームワークでも問題無く稼働すると思われる。

---



## 構成概要

```bash
project-root/
├── shared/                    # Vueソース・node_modules集中管理
│   ├── src/
│   ├── package.json
│   ├── node_modules/
│   ├── capacitor.config.ts
│   ├── .env.development          # 開発用設定ファイル
│   ├── .env.production           # 本番用設定ファイル
│   └── tools/    # 各種ツールスクリプト sync-platform-deps.mjs 等
│
├── android-dev/              # Android 開発用ネイティブ環境
│   ├── package.json
│   ├── capacitor.config.json
│   └── node_modules → ../shared/node_modules (symlink)
│
├── android-prod/              # Android リリースビルド用ネイティブ環境
│   ├── package.json
│   ├── capacitor.config.json
│   └── node_modules → ../shared/node_modules (symlink)
│
├── ios-dev/                  # ios 開発用ネイティブ環境
│   ├── package.json
│   ├── capacitor.config.json
│   └── node_modules → ../shared/node_modules (symlink)
│
├── ios-prod/                  # ios リリースビルド用ネイティブ環境
│   ├── package.json
│   ├── capacitor.config.json
│   └── node_modules → ../shared/node_modules (symlink)
│
└── vite.config.js            # Vite構成（.envと連携）
```

---

## 構築ステップ

### Step 1: shared ディレクトリの準備

> ionicの初期化はsharedディレクトリに対して実施する

```bash
mkdir shared
cd shared
npm init -y
npm install @capacitor/core @capacitor/cli
npm install その他依存ライブラリ（vue, ionic など）

# もしくは以下のコマンド等で一括してionicプロジェクトとして作成
ionic start shared tabs --type vue

# 必須ライブラリとして以下を導入。。。dotenvはビルドモードによる設定変更に必用
npm install @capacitor/android @capacitor/ios dotenv
```


- gitはルートディレクトリで初期化し、ルートディレクトリ及びsharedディレクトリに `.gitignore` を設置するとプロジェクト全体が管理できる
```bash
cd プロジェクトのルートディレクトリ
git init
# .gitignoreが作成されない場合は明示的に実行
touch .gitignore
```

- `shared/package.json` について、以下の値はプラットフォーム側には反映されないので名目上の設定となる（別途各プラットフォーム側で設定）
```json
{
  "name": "app.company.project",
  "description": "MyAppName",
  "version": "0.0.1",
}
```

- `shared/package.json` 内の `scripts` は適宜、また後述するツールの実行コマンドを追記しておく

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test:e2e": "cypress run",
    "test:unit": "vitest",
    "lint": "eslint",

    // ツールの実行コマンド
    "sync:platforms": "node ./tools/sync-platform-deps.mjs"
  },
```

---


### Step 2: .env 関連ファイルの設置

#### shared/ディレクトリ直下に設置（.env.development / .env.production）
ビルド時の --mode オプションで development / production が切り替わり各プラットフォーム側に反映されるので、切り分けたい項目を設定しておく

> 想定される設定項目
```env
# AppId、AppName
VITE_APP_ID=
VITE_APP_NAME=

# Firebase 設定
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=

# AdMob 設定
VITE_ADMOB_BANNER_ID=
VITE_ADMOB_INTERSTITIAL_ID=
VITE_ADMOB_IS_TESTING=

# Remote Config 利用時の制御フラグ等
VITE_REMOTE_FLAG_SAMPLE=

# API エンドポイント設定
VITE_API_BASE_URL=

# 機能フラグ（特定ビルドのみ新機能を表示する等）
VITE_FEATURE_NEW_UI=false

# その他カスタム変数（必要に応じて）
# VITE_ANALYTICS_ENABLED=true
```

.env.development サンプル
```env
# .env.development
VITE_APP_ID=app.company.projectDevelop
VITE_APP_NAME=MyAppNameDevelop

# VITE_FIREBASE_API_KEY=dev-xxxx
# VITE_FIREBASE_PROJECT_ID=myapp-dev
```

.env.production サンプル
```env
# .env.production
VITE_APP_ID=app.company.project
VITE_APP_NAME=MyAppName

# VITE_FIREBASE_API_KEY=xxxx
# VITE_FIREBASE_PROJECT_ID=myapp
```


- 各項目の値はVite（Ionic Vue）側から import.meta.env 経由で参照して実装が可能（変数名にVITE_ プレフィックスの付与が必須）
```ts
  // ts で変数として参照
  const adId = import.meta.env.VITE_ADMOB_AD_ID
  const isTesting = import.meta.env.VITE_ADMOB_IS_TESTING === 'true'
```



---

### Step 3. フレームワーク側のビルド設定

- `shared/vite.config.ts` を作成し、`development /production` の各ビルド時の設定を記述

```ts
export default defineConfig(({ mode }) => {
  // process.env.NODE_ENV でビルドモードを取得
  const typeEnv = process.env.NODE_ENV ?? mode

  // 共通設定
  const baseConfig = {
    plugins: [
      vue(),
      legacy()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }

  if (typeEnv === 'production') {
    // production
    const prodConfig = {
      // 設定を記述
    }
    return { ...baseConfig, ...prodConfig }
  } else {
    // develop
    const devConfig = {
      // 設定を記述
    }
    return { ...baseConfig, ...devConfig }
  }
})

```


---

### Step 4. プラットフォーム向けの設定

- `capacitor.config.ts` を `shared/` に作成、必要があれば各項目を設定

```ts
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
  appName: 'MyAppName',
  webDir: 'dist',
  plugins: {
  },
  // プラットフォーム毎の設定(必要な場合)
  android: {
  }
}

export default config;
```


> vite.config.ts 及び capacitor.config.ts について補足

- 両者とも「ビルドモードごとに設定を切り替える」ことが可能だが、`vite.config.ts は ビルド内容`、 `capacitor.config.ts は ネイティブアプリ設定 ` を司る


| 用途                                        | 適切なファイル               | 例                                       |
| ----------------------------------------- | --------------------- | --------------------------------------- |
| Webビルドの挙動（API URL、minify など）              | `vite.config.ts`      | `/api/dev` と `/api/prod` の切替            |
| ネイティブプラグイン設定（SplashScreen、Edge-to-Edgeなど） | `capacitor.config.ts` | dev: splash 500ms / prod: splash 1200ms |
| `.env` の読込タイミング                           | どちらも可（用途により）          | vite 用・capacitor 用で別指定も可                |


---

### Step 5: プラットフォームディレクトリの作成
※各プラットフォームディレクトリでそれぞれ実施する

```bash
mkdir ios-dev
mkdir android-dev
mkdir ios-prod
mkdir android-prod

cd 各ディレクトリ

# 各プラットフォーム側でshared/node_modulesをsyncして使用する
ln -s ../shared/node_modules

# 各プラットフォーム側に以下ファイルを作成
touch capacitor.config.json
touch package.json
```

#### `各プラットフォームディレクトリ/node_modules` は `shared/node_modules` を sync して使用する

#### `各プラットフォームディレクトリ/capacitor.config.json` を作成
- `appId` `appName` は記載の値がそのままプラットフォーム側に反映される（初回初期化時のみ反映されるのでこの時点で確実に実施）

```json
{
  // Develop
  "appId": "app.company.projectDevelop",
  "appName": "MyAppNameDevelop",

  // Production
  "appId": "app.company.project",
  "appName": "MyAppName",
}
```

#### `各プラットフォームディレクトリ/package.json` を作成

- 以下の値はプラットフォーム側には反映されないが名目上設定しておく（未設定だとbuild、syncが通らない可能性があるので便宜的に設定）

```json
{
  "name": "android-dev",
  "private": true,
}
```

- `dendencies`、`devDependencies` に `Capacitor関連プラグイン` の設定が必要（記載が無いとプラットフォーム側でのsync時にプラグインが読み込まれず）

> 以下のコマンドで `shared/package.json` から必要な項目のみを各プラットフォームディレクトリの `package.json` にコピーできる

```bash
cd shared
npm run sync:platforms
```

- 実行ファイル `shared/tools/sync-platform-deps.mjs`
- `dendencies`、`devDependencies` に加えて `scripts` も必要な項目がコピーされる


> 実行後の記述サンプル

```json
  "dependencies": {
    "@capacitor/app": "^6.0.2",
    "@capacitor/filesystem": "^6.0.3",
    "@capacitor/haptics": "^6.0.2",
    "@capacitor/keyboard": "^6.0.3",
    "@capacitor/preferences": "^6.0.3",
    "@capacitor/share": "^6.0.3",
    "@capacitor/splash-screen": "^6.0.3",
    "@capacitor/status-bar": "^6.0.2"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.4.2"
  },
  "scripts": {
    "sync": "cap sync android",
    "copy": "cap copy android",
    "open": "cap open android",
    "ls": "cap ls",
    "doctor": "cap doctor"
  }
```

- package.json が更新されるライブラリ導入/削除は shared ディレクトリのみで実行し、その後に上記コマンドで各プラットフォーム側に反映する運用を心掛ける


---

### Step 6: プラットフォームディレクトリの初期化

> 各プラットフォームディレクトリでそれぞれ実施する

```bash
cd android-dev
cd ios-dev

# sharedディレクトリ側のcapacitorライブラリを参照して add コマンドを実行
node ../shared/node_modules/@capacitor/cli/bin/capacitor add android
# OR
node ../shared/node_modules/@capacitor/cli/bin/capacitor add ios
```

- それぞれ `/プラットフォームディレクトリ/android` 、`/プラットフォームディレクトリ/ios` が作成される

### Step 7: プラットフォームディレクトリの手動修正

| プラットフォーム | ファイル | 修正内容 |
|------------------|---------|----------|
| Android | `android/app/src/main/AndroidManifest.xml` | `<manifest package="app.company.project">` が生成されていないパターンが多いので、指定したAppIDを反映 |


---


### Step 8: shared ビルド + プラットフォーム sync

> sharedディレクトリでコード修正後 `develop / productionモードを指定してbuild` し、dist ディレクトリを生成 → 各プラットフォームディレクトリからsync を実行して変更を反映させる

- `ionic build` コマンドは使用不可（development / production の --mode オプションを付けて vite build で実行）

- `npx cap sync` ＆ `npx cap open` コマンドは既存の npx コマンドでOK

```bash
cd shared

# 開発環境ビルド
vite build --mode development
# 本番環境ビルド
vite build --mode production

cd ../プラットフォームディレクトリ
npx cap sync

# android
npx cap open android
# ios
npx cap open ios

```

> 運用例

 `開発環境ビルド` 後に ` android-dev、ios-dev ` ディレクトリで `sync、open` して実機にインストール、<br>その後に `本番環境ビルド` 後に ` android-prod、ios-prod ` ディレクトリで同様の手順を行えば、シンプルに両者が実機で共存できる

---


