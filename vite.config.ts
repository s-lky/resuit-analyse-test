import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // 插件：React + TailwindCSS
  plugins: [react(), tailwindcss()],

  // 路径别名：@ 指向项目根目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  // 开发服务器（标准配置）
  server: {
    port: 3000,
    // 注意：由于使用了 VITE_API_BASE_URL 配置完整后端地址，不需要代理
    // 如果需要代理，可以取消下面的注释并修改 .env 中的 VITE_API_BASE_URL 为 '/api'
    /*
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
    */
  }
});