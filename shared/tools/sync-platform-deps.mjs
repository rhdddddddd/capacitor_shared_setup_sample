#!/usr/bin/env node
// shared/tools/sync-platform-deps.mjs
import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


const sharedDir = resolve(__dirname, '..')
const repoRoot = resolve(sharedDir, '..')

// ---- 設定 ----
const autodiscoverPlatforms = true
const pinVersions = true
const platformNamePattern = /^(android|ios)-(dev|pre|prod)$/
// --------------------------------

const sharedPkgPath = resolve(sharedDir, 'package.json')
const sharedPkg = JSON.parse(readFileSync(sharedPkgPath, 'utf8'))

const stripPrefix = v => pinVersions ? String(v).replace(/^[~^]/, '') : String(v)
const pick = (obj = {}, pred) => Object.fromEntries(Object.entries(obj).filter(([k]) => pred(k)))

/**
 * Capacitor 関連とみなす依存の判定：
 * - @capacitor/*（本体・公式プラグイン）
 * - それ以外でも名前に "capacitor" を含むもの（community/サードパーティ）
 */
const isCapacitorDep = (name) => name.startsWith('@capacitor/') || name.includes('capacitor')

// shared の依存から Capacitor 関連だけ抽出
const baseCapsRaw = {
  ...(pick(sharedPkg.dependencies || {}, isCapacitorDep)),
  ...(pick(sharedPkg.devDependencies || {}, (k) => isCapacitorDep(k) && k !== '@capacitor/cli'))
}

const baseCaps = Object.fromEntries(Object.entries(baseCapsRaw).map(([k, v]) => [k, stripPrefix(v)]))


let cliVer = (sharedPkg.devDependencies || {})['@capacitor/cli']
if (!cliVer) {
  console.warn('[warn] @capacitor/cli が shared/devDependencies に見つかりません。7.4.2 を仮定します。')
  cliVer = '7.4.2'
}
cliVer = stripPrefix(cliVer)

// 対象プラットフォームディレクトリの決定
const platformDirs = (() => {
  if (!autodiscoverPlatforms) {
    return ['android-dev', 'android-pre', 'android-prod', 'ios-dev', 'ios-pre', 'ios-prod']
      .map(d => resolve(repoRoot, d))
  }
  return readdirSync(repoRoot, { withFileTypes: true })
    .filter(ent => ent.isDirectory() && platformNamePattern.test(ent.name))
    .map(ent => resolve(repoRoot, ent.name))
})()

if (platformDirs.length === 0) {
  console.error('[error] プラットフォームディレクトリが見つかりませんでした。命名規則や autodiscover 設定を確認してください。')
  process.exit(1)
}

for (const dir of platformDirs) {
  const name = dir.split(/[/\\]/).pop()
  const isAndroid = name.startsWith('android-')
  const isIOS = name.startsWith('ios-')

  const deps = { ...baseCaps }
  if (isAndroid) delete deps['@capacitor/ios']
  if (isIOS) delete deps['@capacitor/android']

  const pkg = {
    name,
    private: true,
    dependencies: deps,
    devDependencies: { '@capacitor/cli': cliVer },
    scripts: {
      sync: `cap sync ${isAndroid ? 'android' : 'ios'}`,
      copy: `cap copy ${isAndroid ? 'android' : 'ios'}`,
      open: `cap open ${isAndroid ? 'android' : 'ios'}`,
      ls: 'cap ls',
      doctor: 'cap doctor'
    }
  }

  const outPath = resolve(dir, 'package.json')
  writeFileSync(outPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('Wrote', outPath)

  const nm = join(dir, 'node_modules')
  try {
    const st = lstatSync(nm)
    if (!st.isSymbolicLink()) {
      console.warn(`[warn] ${name}/node_modules は symlink ではありません。shared/node_modules へのリンクを推奨します。`)
    }
  } catch {
    console.warn(`[warn] ${name}/node_modules が存在しません。symlink を作成してください（例: ln -s ../shared/node_modules node_modules）。`)
  }
}

console.log('\n[done] 各プラットフォームの package.json を更新しました。')
console.log('       次は shared で build → 各プラットフォームで cap sync を実行してください。')
