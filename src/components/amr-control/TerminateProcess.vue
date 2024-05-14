<script setup>

import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { inject } from 'vue'

const $q = useQuasar()
const { t } = useI18n()
const rosClient = inject('rosClient')
const mapState = inject('mapState')

function stopProcess () {
  $q.dialog({
    title: t('amr2d_stop_process'),
    message: t('amr2d_stop_process_description'),
    cancel: { label: t('cancel'), flat: true, color: 'secondary' },
    ok: { label: t('ok'), flat: true, color: 'primary', class: 'text-bold' },
    persistent: true
  }).onOk(() => {
    rosClient.publish('/map_command', { data: 'stop' })
  })
}
</script>

<template>
  <q-btn no-wrap v-if="mapState !== 'idle'" key="stop-process" rounded :label="$t('amr2d_stop_process')" color="warning" icon="stop" @click="stopProcess"/>
</template>
