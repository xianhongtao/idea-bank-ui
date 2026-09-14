import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages 上站点挂在 /<repo>/ 子路径下，构建产物必须用这个 base，
 * 否则 index.html 里的 /assets/... 会 404。本地 dev 仍在根路径。
 * 路由是 hash 路由，所以子路径下不需要任何服务端 rewrite / 404 兜底。
 */
const PAGES_BASE = '/idea-bank-ui/';

export default defineConfig(({ command }) => ({
    base: command === 'build' ? PAGES_BASE : '/',
    plugins: [react()],
    server: {
        port: 5173,
        open: false,
    },
}));
