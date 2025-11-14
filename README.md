# Capacitor Shared Setup Sample

[![Ionic](https://img.shields.io/badge/Ionic-8.0-blue?logo=ionic)](https://ionicframework.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.0-003A76?logo=capacitor)](https://capacitorjs.com/)
[![Vue.js](https://img.shields.io/badge/Vue-3.0-42b883?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-FDCA40?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)


**Capacitor ハイブリッドアプリプロジェクト Shared構成導入サンプル（Android/ios対応）**


## 概要

`Capacitor` を利用したハイブリッドアプリ開発時に、develop / production ビルド及び ios / Android プラットフォームの各環境でソースコード等を共有しつつ、明確にappIdや設定を分けられる構成となっています。（実機に各ビルドのAppを同時にインストールして検証する際に便利）<br>
develop / production 以外に staging 等の環境を追加することも可能。<br>
Vue.jsでの運用を想定していますが、他のフレームワークでも問題無く稼働すると思われる。



## 技術スタック

| レイヤー | 技術 |
|-----------|------|
| フロントエンド | Vue.js 3 (Composition API) |
| UIフレームワーク | Ionic 8 |
| ネイティブ連携 | Capacitor 7 |
| ビルドツール | Vite |
| 使用言語 | TypeScript / HTML / SCSS |
| 対応プラットフォーム | Android / iOS / PWA |



## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/rhdddddddd/capacitor_shared_setup_sample.git
cd capacitor_shared_setup_sample
```

### 2. 詳細な手順は以下参照
[/docs/README.md](/docs/README.md)



## ディレクトリ構成

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


## 参考リンク

- [Ionic Framework 公式ドキュメント](https://ionicframework.com/docs)
- [Capacitor 公式ドキュメント](https://capacitorjs.com/docs)
- [Vue.js ガイド](https://vuejs.org/guide/introduction.html)
- [Vite ガイド](https://vitejs.dev/guide/)
- [Ionic Vue Integration Guide](https://ionicframework.com/docs/vue/overview)


##  ライセンス
このプロジェクトは **MIT License** の下で公開されています。
詳細は [LICENSE](./LICENSE) を参照してください。


## 開発者

* rhdddddddd
* https://github.com/rhdddddddd


==========================================================================


# Capacitor Shared Setup Sample

[![Ionic](https://img.shields.io/badge/Ionic-8.0-blue?logo=ionic)](https://ionicframework.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.0-003A76?logo=capacitor)](https://capacitorjs.com/)
[![Vue.js](https://img.shields.io/badge/Vue-3.0-42b883?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-FDCA40?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)


**Capacitor Hybrid App Project Shared Configuration Implementation Sample (Android/iOS Compatible)**


## Overview

When developing hybrid apps using Capacitor, this configuration allows you to share source code and other information between development/production builds and iOS/Android platform environments, while clearly separating app IDs and settings. (This is convenient for simultaneously installing and testing each build on a real device.)
It is also possible to add environments such as staging in addition to development/production.
It is designed for use with Vue.js, but should work with other frameworks as well.


## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | Vue.js 3 (Composition API) |
| UI Framework | Ionic 8 |
| Native Bridge | Capacitor 7 |
| Build Tool | Vite |
| Languages | TypeScript / HTML / SCSS |
| Platforms | Android / iOS / PWA |

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/rhdddddddd/capacitor_shared_setup_sample.git
cd capacitor_shared_setup_sample
```

### 2. See below for detailed instructions（Japanese only）
[/docs/README.md](/docs/README.md)


## Project Structure

```bash
project-root/
├── shared/     # Centralized management of Vue source and node_modules
│   ├── src/
│   ├── package.json
│   ├── node_modules/
│   ├── capacitor.config.ts
│   ├── .env.development    # Development configuration files
│   ├── .env.production     # Production configuration file
│   └── tools/  # Various tool scripts such as sync-platform-deps.mjs
│
├── android-dev/       # Native Android development environment
│   ├── package.json
│   ├── capacitor.config.json
│   └── node_modules → ../shared/node_modules (symlink)
│
├── android-prod/      # Native environment for Android release builds
│   ├── package.json
│   ├── capacitor.config.json
│   └── node_modules → ../shared/node_modules (symlink)
│
├── ios-dev/           # Native iOS development environment
│   ├── package.json
│   ├── capacitor.config.json
│   └── node_modules → ../shared/node_modules (symlink)
│
├── ios-prod/          # Native environment for iOS release build
│   ├── package.json
│   ├── capacitor.config.json
│   └── node_modules → ../shared/node_modules (symlink)
│
└── vite.config.js     # Vite configuration (works with .env)
```

## Useful Links

- [Ionic Framework Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Ionic Vue Integration Guide](https://ionicframework.com/docs/vue/overview)


## License
This project is released under the **MIT License**.
See [LICENSE](./LICENSE) for details.


# Author

* rhdddddddd
* https://github.com/rhdddddddd
