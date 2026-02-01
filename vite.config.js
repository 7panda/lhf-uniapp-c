import { loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'path';
import uniReadPagesV3Plugin from './src/sheep/router/utils/uni-read-pages-v3';
import mpliveMainfestPlugin from './src/sheep/libs/mpLive-manifest-plugin';

export default ({ mode }) => {
    const env = loadEnv(mode, __dirname, 'SHOPRO_');
    
    return {
        envPrefix: "SHOPRO_",
        plugins: [
            uni(),
            uniReadPagesV3Plugin({
                pagesJsonDir: path.resolve(__dirname, './src/pages.json'),
                includes: ['path', 'aliasPath', 'name', 'meta'],
            }),
            // 如果你完全不使用直播功能，建议在这里直接传入 false
            mpliveMainfestPlugin(env.SHOPRO_MPLIVE_ON === 'true')
        ],
        
        // --- 新增/优化构建配置 ---
        build: {
            // 1. 启用 terser 压缩（需要安装：npm install terser -D）
            // 如果不想安装，可以用默认的 'esbuild'，但 terser 压缩得更干净
            minify: 'terser', 
            terserOptions: {
                compress: {
                    // 发行时自动删除代码中的 console.log，减小包体积并提高性能
                    drop_console: true,
                    drop_debugger: true,
                },
            },
            // 2. 调整 chunk 大小警告限制
            chunkSizeWarningLimit: 1500,
            rollupOptions: {
                // 3. 确保 Tree-shaking 开启
                treeshake: true,
                output: {
                    // 压缩静态资源名称
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
                },
            },
        },
        
        server: {
            host: true,
            port: env.SHOPRO_DEV_PORT,
            hmr: {
                overlay: true,
            },
        },
    };
};