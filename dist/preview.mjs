const nuxtApp = () => import('#app/entry').then((m) => m.default).catch((err) => {
});
const app = nuxtApp();

export { app as default };
