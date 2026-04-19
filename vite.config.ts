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
    port: 3000, // 可选，默认端口
    open: true, // 可选，自动打开浏览器
  },
});