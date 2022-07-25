// app.js (shared between server and client)
import { createSSRApp } from 'vue';
// import viteSSR from 'vite-ssr';
import App from "./App.vue";
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: App },
  { path: '/about', component: App },
]

export function createApp() {
  const app = createSSRApp(App);
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes
  });
  app.use(router);
  return { app, router };
}

// export default viteSSR(
//   App,
//   {routes}, 
//   (context) => {
//      Vite SSR main hook for custom logic 
//     const { app, router, initialState } = context;
//   }
// )