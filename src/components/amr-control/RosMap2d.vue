<script setup>

import { inject, provide, onMounted, ref, watch } from 'vue'

import RosMapPixi from 'components/amr-control/RosMapPixi'
import RobotRelocate from 'components/amr-control/RobotRelocate.vue'
import MapSelector from 'components/amr-control/MapSelector.vue'
import MapCreate from 'components/amr-control/MapCreate.vue'
import PoseManager from 'components/map-pose/PoseManager.vue'
import { useControlParams } from 'stores/control-params'

const rosClient = inject('rosClient')
const connected = inject('connected')
const mapState = inject('mapState')

watch(connected, value => {
  if (value) {
    rosClient.subscribe(controlParam.mapTopic)
    rosClient.subscribe(controlParam.laserScanTopic)
    rosClient.subscribe('/robot_pose')
    rosClient.subscribe('/map_state')
  }
})

const controlParam = useControlParams()
const mapManager = RosMapPixi()
provide('mapManager', mapManager)
const pixiContainer = ref(null)

onMounted(() => {
  mapManager.init({ canvas: pixiContainer.value })
  rosClient.loadMapRaw.value = mapManager.processMapRaw
  if (controlParam.laserScanEnable) rosClient.loadLaserScan.value = mapManager.processLaserScan
})

const robotPose = inject('robotPose')
watch(robotPose, value => {
  if (pageMode.value !== 'navigation') mapManager.updateRobotPose(value.pose)
})

const pageMode = ref('default')
provide('pageMode', pageMode)

const focusing = ref(mapManager.focusing)
const robotRelocate = ref()

</script>

<template>
  <q-page-sticky position="top" :offset="[15, 15]">
    <div class="row q-gutter-sm q-pb-sm scrollable-row">
      <q-btn key="no-focus" v-if="focusing"  rounded outline :label="$t('amr2d_no_focus')"
             @click="mapManager.focusing = false; focusing = false" color="negative" icon="navigation"/>
      <q-btn key="focusing" v-else rounded :label="$t('amr2d_focus')"
             @click="mapManager.focusing = true; focusing = true" color="primary" icon="navigation"/>

      <transition-group
        appear
        enter-active-class="animated zoomIn"
        leave-active-class="animated zoomOut"
      >
        <q-btn key="navigation" v-if="!controlParam.requireMapState || mapState === 'navigation' && pageMode !== 'mapPose'" rounded
               :label="$t('amr2d_navigation_relocate')" color="primary"
               :outline="pageMode === 'navigation'" icon="label_important_outline"
               @click="pageMode === 'navigation'?(pageMode = 'default'):(pageMode='navigation')"/>
        <q-btn key="navigation-cancel" v-if="pageMode==='navigation'" :label="$t('cancel')" rounded color="warning"
               @click="robotRelocate.cancel()"/>
        <q-btn key="map-pose" v-if="mapState === 'navigation'  && pageMode !== 'navigation'" rounded
               :label="$t('mapPose')" color="accent"
               :outline="pageMode === 'mapPose'" icon="grain"
               @click="pageMode === 'mapPose'?(pageMode = 'default'):(pageMode='mapPose')"/>
        <map-create v-if="pageMode === 'default'" key="map-create"/>
        <map-selector v-if="pageMode === 'default'" key="map-selector"/>
      </transition-group>
    </div>
  </q-page-sticky>
  <canvas ref="pixiContainer" class="full-width full-height"/>
  <RobotRelocate ref="robotRelocate"/>
  <pose-manager/>
</template>

<style scoped>
.scrollable-row {
  display: inline-block;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  max-height: 3rem;
  white-space: nowrap;
}
</style>
