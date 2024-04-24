<template>
  <router-view />
</template>

<script>
import { defineComponent, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useControlParams } from 'stores/control-params'

export default defineComponent({
  name: 'App',
  setup () {
    const { locale } = useI18n({ useScope: 'global' })
    const params = useControlParams()
    locale.value = params.locale

    onBeforeMount(() => {
      if (params.ip === 'localhost') {
        let pos = window.location.href.indexOf('://')
        let deviceIP
        if (pos >= 0) {
          pos += 3
          deviceIP = window.location.href.slice(pos)
          deviceIP = deviceIP.split(':')[0]
          deviceIP = deviceIP.split('/')[0]
          params.ip = deviceIP
        }
      }
    })
  }
})
</script>

<style>
#q-app {
  overflow: hidden;
}
</style>
