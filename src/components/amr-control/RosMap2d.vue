<script setup>

import { inject, provide, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'

import RosMapPixi from 'components/amr-control/RosMapPixi'
import RobotRelocate from 'components/amr-control/RobotRelocate.vue'
import { useI18n } from 'vue-i18n'
import MapSelector from 'components/amr-control/MapSelector.vue'

const $q = useQuasar()
const { t } = useI18n()

const rosClient = inject('rosClient')
const connected = inject('connected')
const publish = inject('publish')
const mapState = inject('mapState')

watch(connected, value => {
  if (value) {
    rosClient.subscribe('/map')
    rosClient.subscribe('/map_metadata')
    rosClient.subscribe('/robot_pose')
    rosClient.subscribe('/map_state')
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
const focusing = ref(mapManager.focusing)

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
  <q-page-sticky position="top" :offset="[15, 15]">
    <div class="row q-gutter-sm">
      <q-btn key="no-focus" v-if="focusing"  rounded outline :label="$t('amr2d_no_focus')" @click="mapManager.focusing = false; focusing = false" color="negative" icon="navigation"/>
      <q-btn key="focusing" v-else rounded :label="$t('amr2d_focus')" @click="mapManager.focusing = true; focusing = true" color="primary" icon="navigation"/>

      <transition-group
        appear
        enter-active-class="animated zoomIn"
        leave-active-class="animated zoomOut"
      >
        <q-btn key="navigation" v-if="mapState === 'navigation' " rounded :label="$t('amr2d_navigation_relocate')" color="primary" :outline="isRelocating" icon="label_important_outline" @click="isRelocating = !isRelocating"/>
        <q-btn key="mapping" v-if="mapState !== 'mapping'" rounded :label="$t('amr2d_createMap')" color="secondary" icon="explore" @click="mapCommand('start')"/>
        <q-btn key="save-map" v-else rounded :label="$t('amr2d_saveMap')" color="secondary" icon="save" @click="saveMap"/>
        <map-selector key="map-selector"/>
      </transition-group>
    </div>
  </q-page-sticky>
  <canvas ref="pixiContainer" class="full-width full-height"/>
  <RobotRelocate/>
</template>
