import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'markdown-loader',
      transform(code, id) {
        if (id.slice(-3) === '.md') {
          return `export default ${JSON.stringify(code)};`;
        }
      },
    },
    Sitemap({
      hostname: 'https://www.gracesent.com',
      dynamicRoutes: [
        '/',
        '/about',
        '/contact',
        '/jobrequest',
        '/businessintelligence',
        '/publishing',
        '/projects/bible-blockchain',
        '/projects/christian-boardgames',
        '/projects/light-pictures',
      ],
    }),
  ],
});