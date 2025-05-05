import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    optimizeDeps: {
      exclude: ['fsevents']
    },
    ssr: {
      external: ['fsevents'],
    }
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      
      // Read the index.html file
      const template = await vite.transformIndexHtml(
        url,
        await fs.readFile(resolve(__dirname, '../index.html'), 'utf-8')
      );
      
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
      const { html: appHtml,  } = await render(url);
      
      const html = template
        .replace(`<div id="root"></div>`, `<div id="root">${appHtml}</div>`)
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return { app, vite };
}

createServer().then(({ app }) => {
  app.listen(3001, () => {
    console.log('Server running at http://localhost:3001');
  });
});