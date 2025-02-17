import type { DefineComponent } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
export type NuxtLinkOptions = {
    componentName?: string;
    externalRelAttribute?: string | null;
    activeClass?: string;
    exactActiveClass?: string;
    prefetchedClass?: string;
    trailingSlash?: 'append' | 'remove';
};
export type NuxtLinkProps = {
    to?: RouteLocationRaw;
    href?: RouteLocationRaw;
    external?: boolean;
    replace?: boolean;
    custom?: boolean;
    target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null;
    rel?: string | null;
    noRel?: boolean;
    prefetch?: boolean;
    noPrefetch?: boolean;
    activeClass?: string;
    exactActiveClass?: string;
    ariaCurrentValue?: string;
};
/*! @__NO_SIDE_EFFECTS__ */
export declare function defineNuxtLink(options: NuxtLinkOptions): DefineComponent<NuxtLinkProps>;
declare const _default: DefineComponent<NuxtLinkProps>;
export default _default;
