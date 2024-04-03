<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useControlParams } from 'stores/control-params'

export default defineComponent({
  name: 'App',
  setup () {
    const { locale } = useI18n({ useScope: 'global' })
    const params = useControlParams()
    locale.value = params.locale
  }
})
</script>

<style>
#q-app {
  overflow: hidden;
}
</style>
