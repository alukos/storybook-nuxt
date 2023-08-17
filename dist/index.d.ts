import { BuilderOptions, StorybookConfig as StorybookConfig$1 } from '@storybook/types';
export * from '@storybook/vue3';

type FrameworkName = '@storybook-vue/nuxt';
type BuilderName = '@storybook/builder-vite';

type FrameworkOptions = NuxtOptions & {
  builder?: BuilderOptions;
};

type StorybookConfigFramework = {
  framework: FrameworkName | { name: FrameworkName; options: FrameworkOptions}
  core?: StorybookConfig$1['core'] & { builder?: BuilderName  }  
  typescript?: StorybookConfig$1['typescript'];
  previewAnnotations?: StorybookConfig$1['previewAnnotations'];
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
type StorybookConfig = { viteFinal:Record<string, any>  } & StorybookConfigFramework;

interface NuxtOptions {
}

export { FrameworkOptions, NuxtOptions, StorybookConfig };
