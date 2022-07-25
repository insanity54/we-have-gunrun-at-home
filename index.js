import fs from 'fs'
import path from 'path'
import express from 'express'


import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { createServer } from 'http';
import favicon from 'express-favicon';
import { createSSRApp } from 'vue';
const __dirname = dirname(fileURLToPath(import.meta.url));



// 
// app.get('/', (req, res) => {
//   console.log('therrrrrres root!')
//   const vueApp = createVueApp();
//   renderToString(vueApp).then(html => {
//     res.send(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Vue SSR Example</title>
          
//         </head>
//         <body>
//           <div id="app">${html}</div>
//           <script type="module" src="./index.js"></script>
//         </body>
//       </html>
//     `)
//   })
// })







const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

async function createWHGAHServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production',
) {
  const resolve = (p) => path.resolve(__dirname, p)

  const indexProd = isProd
    ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
    : ''

  const manifest = isProd
    // @ts-expect-error dist file
    ? await import('./dist/client/ssr-manifest.json')
    : {}

  const app = express()

  let vite
  if (!isProd) {
    vite = await import('vite').then(i => i.createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
      },
    }))
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use(await import('compression').then(i => i.default()))
    app.use(await import('serve-static')
      .then(i => i.default(resolve('dist/client'), {
        index: false,
      })),
    )
  }

  app.use('*', async(req, res) => {
    try {
      const url = req.originalUrl

      let template, render
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.ts')).render
      } else {
        template = indexProd
        // @ts-expect-error dist file
        render = await import('./dist/server/entry-server.js').then(i => i.render)
      }

      const [appHtml, preloadLinks] = await render(url, manifest)

      const html = template
        .replace('<!--preload-links-->', preloadLinks)
        .replace('<!--app-html-->', appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite && vite.ssrFixStacktrace(e)
      // eslint-disable-next-line no-console
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  app.use(favicon(__dirname+'/favicon.ico'));

  // @ts-expect-error used before assign
  return { app, vite }
}

if (!isTest) {
  createWHGAHServer().then(({ app }) => {



    const httpServer = createServer(app);
    const io = new Server(httpServer);

    console.log(httpServer);


    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`  [*] listening on port ${PORT}`);
    });

    io.on('connection', (socket) => {
      console.log('  [*] io connection');
      socket.emit(`  [*] connection ${socket.id}`);

      setInterval(() => {
        socket.emit('tts', { 
          u: 'chris',
          t: `taco bell`,
          p: 1,
          r: 1
        });
      }, 2000);
    })



    // app.listen(3000, () => {
    //   // eslint-disable-next-line no-console
    //   console.log('🚀  Server listening on http://localhost:3000')
    // }),
  })
}

// for test use
export default createWHGAHServer