<script setup>
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { inject } from 'vue'

const $q = useQuasar()
const { t } = useI18n()

const publish = inject('publish')
const mapState = inject('mapState')

function mapCommand (command) {
  publish('/map_command', { data: command })
}

function saveMap () {
  $q.dialog({
    title: t('amr2d_saveMap'),
    message: t('amr2d_saveMap_description'),
    prompt: {
      model: '',
      type: 'text' // optional
    },
    cancel: { label: t('cancel'), flat: true, color: 'secondary' },
    ok: { label: t('ok'), flat: true, color: 'primary', class: 'text-bold' },
    persistent: true
  }).onOk(data => {
    mapCommand('save ' + data)
  })
}
</script>

<template>
  <q-btn key="mapping" v-if="mapState !== 'mapping'" rounded :label="$t('amr2d_createMap')" color="secondary" icon="explore" @click="mapCommand('start')"/>
  <q-btn key="save-map" v-else rounded :label="$t('amr2d_saveMap')" color="secondary" icon="save" @click="saveMap"/>
</template>
