/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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


