import {  createNuxtApp, defineNuxtPlugin } from "#app/nuxt"
// @ts-expect-error virtual file
import  plugins  from "#build/plugins"
import { App } from "vue";


const globalWindow = window as any;

export default defineNuxtPlugin({
    name: 'storybook-nuxt-plugin',
    enforce: 'pre', // or 'post'

    setup(nuxtApp: any) {
   
      if(nuxtApp.globalName !== 'nuxt')
      return
    
      const applyNuxtPlugins = async (vueApp: App,storyContext:any) => {
        const nuxt = createNuxtApp({vueApp, globalName: `nuxt-${storyContext.id}`})
        nuxt.callHook('app:created', vueApp)
        for (const plugin of plugins) {
          try{
            if(typeof plugin === 'function' && !plugin.toString().includes('definePayloadReviver')){
              await vueApp.runWithContext(()  => plugin(nuxt))
            }
          }catch(e){
            console.log('error in plugin',e)
          }
        }
      
        return nuxt
      }
      
      globalWindow.STORYBOOK_VUE_GLOBAL_PLUGINS = []
      globalWindow.NUXT_APPLY_PLUGINS_FUNC = applyNuxtPlugins
    },
  
    hooks: {
      'app:created'(nuxtApp: any)  {},
    }
})



