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
      hostname: 'https://www.your-domain.com',
      dynamicRoutes: [
        '/',
        '/about',
        '/contact',
        '/jobrequest',
        '//businessintelligence',
        '/projectlist',
        '/projects/road-rage',
        '/projects/socratic-discussion',
        '/projects/elf-bowling',
      ],
    }),
  ],
});