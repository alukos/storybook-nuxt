import { PresetProperty } from '@storybook/types';
import { StorybookConfig } from './index.js';
import '@storybook/vue3';

declare const core: PresetProperty<'core', StorybookConfig>;
/**
 *
 * @param entry preview entries
 * @returns preview entries with nuxt runtime
 */
declare const previewAnnotations: StorybookConfig['previewAnnotations'];
declare const viteFinal: StorybookConfig['viteFinal'];

export { core, previewAnnotations, viteFinal };
