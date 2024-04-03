<script setup>

import { inject, provide, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'

import RosMapPixi from 'components/amr-control/RosMapPixi'
import RobotRelocate from 'components/amr-control/RobotRelocate.vue'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()

const rosClient = inject('rosClient')
const connected = inject('connected')
const publish = inject('publish')

watch(connected, value => {
  if (value) {
    rosClient.subscribe('/map')
    rosClient.subscribe('/map_metadata')
    rosClient.subscribe('/robot_pose')
  }
})

const mapManager = RosMapPixi()
provide('mapManager', mapManager)
const pixiContainer = ref(null)
const loadMapRaw = inject('loadMapRaw')

onMounted(() => {
  mapManager.init({ canvas: pixiContainer.value })
  loadMapRaw.value = mapManager.processMapRaw
})

const robotPose = inject('robotPose')
watch(robotPose, value => {
  if (!isRelocating.value) mapManager.updateRobotPose(value.pose)
})

function mapCommand (command) {
  publish('/map_command', { data: command })
}

const isRelocating = ref(false)
provide('isRelocating', isRelocating)

function saveMap () {
  $q.dialog({
    title: t('amr2d_saveMap'),
    message: t('amr2d_loadMap_description'),
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

function loadMap () {
  $q.dialog({
    title: t('amr2d_loadMap'),
    message: t('amr2d_loadMap_description'),
    prompt: {
      model: '',
      type: 'text' // optional
    },
    cancel: { label: t('cancel'), flat: true, color: 'secondary' },
    ok: { label: t('ok'), flat: true, color: 'primary', class: 'text-bold' },
    persistent: true
  }).onOk(data => {
    mapCommand('load ' + data)
  })
}

</script>

<template>
  <q-page-sticky position="top" :offset="[15, 15]">
    <div class="row q-gutter-sm">
      <q-btn rounded :label="$t('amr2d_focus')" @click="mapManager.focus" color="primary" icon="navigation"/>
      <q-btn rounded :label="$t('amr2d_navigation_relocate')" color="primary" :outline="isRelocating" icon="label_important_outline" @click="isRelocating = !isRelocating"/>
      <q-btn-group rounded>
        <q-btn rounded :label="$t('amr2d_createMap')" color="secondary" icon="explore" @click="mapCommand('start')"/>
        <q-btn rounded :label="$t('amr2d_loadMap')" color="primary" icon="download" @click="loadMap"/>
      </q-btn-group>
      <q-btn rounded :label="$t('amr2d_saveMap')" color="primary" icon="save" @click="saveMap"/>
    </div>
  </q-page-sticky>
  <canvas ref="pixiContainer" class="full-width full-height"/>
  <RobotRelocate/>
</template>
