import { resolve, join } from 'path';
import { mergeConfig, searchForWorkspaceRoot } from 'vite';
import { fileURLToPath } from 'node:url';

const packageDir = resolve(fileURLToPath(import.meta.url), "../..");
const distDir = resolve(fileURLToPath(import.meta.url), "..");
const runtimeDir = resolve(distDir, "runtime");
const pluginsDir = resolve(runtimeDir, "plugins");
const componentsDir = resolve(runtimeDir, "components");
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
      src: join(runtimeDir, "plugins/storybook"),
      mode: "client"
    });
    extendComponents(nuxt);
    extendPages(nuxt);
    nuxt.hook(
      "vite:extendConfig",
      (config, { isClient }) => {
        if (isClient) {
          extendedConfig = mergeConfig(config, baseConfig);
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
  return [...entry, resolve(join(__dirname, "../preview"))];
};
const viteFinal = async (config, options) => {
  const getStorybookViteConfig = async (c, o) => {
    const { viteFinal: viteFinal2 } = await import(require.resolve(join("@storybook/vue3-vite", "preset")));
    return viteFinal2(c, o);
  };
  const nuxtConfig = await defineNuxtConfig(await getStorybookViteConfig(config, options));
  const { enabled, proxy } = getDevtoolsConfig(nuxtConfig.nuxt);
  return mergeConfig(nuxtConfig.viteConfig, {
    build: { rollupOptions: { external: ["vue", "vue-demi"] } },
    define: {
      __NUXT__: JSON.stringify({ config: nuxtConfig.nuxt.options.runtimeConfig })
    },
    server: {
      cors: true,
      proxy: enabled ? proxy : {},
      fs: { allow: [searchForWorkspaceRoot(process.cwd()), packageDir, runtimeDir, pluginsDir, componentsDir] }
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
    nuxtLink.filePath = join(runtimeDir, "components/nuxt-link");
    nuxtLink.shortPath = join(runtimeDir, "components/nuxt-link");
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

export { core, previewAnnotations, viteFinal };
