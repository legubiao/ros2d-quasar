<script setup>

import { inject, onMounted, ref, watch } from 'vue'
import RosMapPixi from 'components/amr-control/RosMapPixi'

const rosClient = inject('rosClient')
const connected = inject('connected')

watch(connected, value => {
  if (value) {
    rosClient.subscribe('/map')
    rosClient.subscribe('/map_metadata')
    rosClient.subscribe('/robot_pose')
  }
})

const mapManager = RosMapPixi()
const pixiContainer = ref(null)
const loadMapRaw = inject('loadMapRaw')

onMounted(() => {
  mapManager.init({ canvas: pixiContainer.value })
  loadMapRaw.value = mapManager.processMapRaw
})

const robotPose = inject('robotPose')
watch(robotPose, value => {
  mapManager.updateRobotPose(value.pose)
})

</script>

<template>
  <canvas ref="pixiContainer" class="full-width full-height"/>
  <q-page-sticky position="top" :offset="[15, 15]">
    <div class="row q-gutter-sm">
      <q-btn round @click="mapManager.focus" color="primary" icon="navigation"/>
    </div>
  </q-page-sticky>
</template>
