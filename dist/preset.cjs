'use strict';

const path = require('path');
const vite = require('vite');
const node_url = require('node:url');

const packageDir = path.resolve(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('preset.cjs', document.baseURI).href))), "../..");
const distDir = path.resolve(node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (document.currentScript && document.currentScript.src || new URL('preset.cjs', document.baseURI).href))), "..");
const runtimeDir = path.resolve(distDir, "runtime");
const pluginsDir = path.resolve(runtimeDir, "plugins");
const componentsDir = path.resolve(runtimeDir, "components");
async function defineNuxtConfig(baseConfig) {
  const { loadNuxt, buildNuxt, addPlugin } = await import(require.resolve("@nuxt/kit"));
  const nuxt = await loadNuxt({
    rootDir: baseConfig.root,
    ready: false,
    dev: false
  });
  if (nuxt.options.builder !== "@nuxt/vite-builder") {
    throw new Error(`Storybook-Nuxt does not support '${nuxt.options.builder}' for now.`);
  }
  nuxt.options.app.rootId = "storybook-root";
  let extendedConfig = {};
  nuxt.hook("modules:done", () => {
    addPlugin({
      src: path.join(runtimeDir, "plugins/storybook"),
      mode: "client"
    });
    extendComponents(nuxt);
    extendPages(nuxt);
    nuxt.hook(
      "vite:extendConfig",
      (config, { isClient }) => {
        if (isClient) {
          extendedConfig = vite.mergeConfig(config, baseConfig);
        }
      }
    );
  });
  await nuxt.ready();
  try {
    await buildNuxt(nuxt);
    return {
      viteConfig: extendedConfig,
      nuxt
    };
  } catch (e) {
    throw new Error(e);
  }
}
const core = async (config, options) => {
  return {
    ...config,
    builder: "@storybook/builder-vite",
    renderer: "@storybook/vue3"
  };
};
const previewAnnotations = (entry = []) => {
  return [...entry, path.resolve(path.join(__dirname, "../preview"))];
};
const viteFinal = async (config, options) => {
  const getStorybookViteConfig = async (c, o) => {
    const { viteFinal: viteFinal2 } = await import(require.resolve(path.join("@storybook/vue3-vite", "preset")));
    return viteFinal2(c, o);
  };
  const nuxtConfig = await defineNuxtConfig(await getStorybookViteConfig(config, options));
  const { enabled, proxy } = getDevtoolsConfig(nuxtConfig.nuxt);
  return vite.mergeConfig(nuxtConfig.viteConfig, {
    build: { rollupOptions: { external: ["vue", "vue-demi"] } },
    define: {
      __NUXT__: JSON.stringify({ config: nuxtConfig.nuxt.options.runtimeConfig })
    },
    server: {
      cors: true,
      proxy: enabled ? proxy : {},
      fs: { allow: [vite.searchForWorkspaceRoot(process.cwd()), packageDir, runtimeDir, pluginsDir, componentsDir] }
    },
    preview: {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }
    },
    envPrefix: ["NUXT_"]
  });
};
function getDevtoolsConfig(nuxt) {
  const devtools = nuxt.options.runtimeConfig.public["devtools"] || {};
  const port = devtools.port?.toString() ?? "12442";
  const route = "/__nuxt_devtools__/client";
  const proxy = {
    [route]: {
      target: `http://localhost:${port}${route}`,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(route, ""),
      ws: true
    }
  };
  return {
    enabled: nuxt.options.devtools,
    port,
    route,
    proxy
  };
}
function extendComponents(nuxt) {
  nuxt.hook("components:extend", (components) => {
    const nuxtLink = components.find(({ name }) => name === "NuxtLink");
    nuxtLink.filePath = path.join(runtimeDir, "components/nuxt-link");
    nuxtLink.shortPath = path.join(runtimeDir, "components/nuxt-link");
    nuxt.options.build.transpile.push(nuxtLink.filePath);
  });
}
function extendPages(nuxt) {
  nuxt.hook("pages:extend", (pages) => {
    pages.push({
      name: "iframe.html",
      path: "/"
    });
  });
}

exports.core = core;
exports.previewAnnotations = previewAnnotations;
exports.viteFinal = viteFinal;
