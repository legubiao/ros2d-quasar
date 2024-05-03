<script setup>

import { inject, provide, onMounted, ref, watch } from 'vue'

import RosMapPixi from 'components/amr-control/RosMapPixi'
import RobotRelocate from 'components/amr-control/RobotRelocate.vue'
import MapSelector from 'components/amr-control/MapSelector.vue'
import MapCreate from 'components/amr-control/MapCreate.vue'
import PoseManager from 'components/map-pose/PoseManager.vue'
import { useControlParams } from 'stores/control-params'
import { useVisualization } from 'stores/visualization'

const rosClient = inject('rosClient')
const connected = inject('connected')
const mapState = inject('mapState')
const visualization = useVisualization()
const controlParam = useControlParams()

watch(connected, value => {
  if (value) {
    rosClient.subscribe(controlParam.mapTopic)
    rosClient.subscribe('/robot_pose')
    rosClient.subscribe('/map_state')
    if (visualization.pathEnable) rosClient.subscribe(visualization.pathTopic)
    if (visualization.laserScanEnable) rosClient.subscribe(visualization.laserScanTopic)
    if (visualization.trajectoryEnable) rosClient.subscribe(visualization.trajectoryTopic)
  }
})

const mapManager = RosMapPixi()
provide('mapManager', mapManager)
const pixiContainer = ref(null)

onMounted(() => {
  mapManager.init({ canvas: pixiContainer.value })
  rosClient.loadMapRaw.value = mapManager.processMapRaw
  if (visualization.laserScanEnable) rosClient.loadLaserScan.value = mapManager.processLaserScan
  if (visualization.pathEnable) rosClient.loadPath.value = mapManager.processPath
  if (visualization.trajectoryEnable) rosClient.loadTrajectory.value = mapManager.processTrajectory
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
  <q-page-sticky position="top">
    <q-scroll-area style="height: 3.5rem; width: 100vw" class="q-pa-sm">
      <div class="no-wrap flex q-gutter-x-sm justify-center">
        <q-btn key="no-focus" no-wrap v-if="focusing"  rounded outline :label="$t('amr2d_no_focus')"
               @click="mapManager.focusing = false; focusing = false" color="negative" icon="navigation"/>
        <q-btn key="focusing" no-wrap v-else rounded :label="$t('amr2d_focus')"
               @click="mapManager.focusing = true; focusing = true" color="primary" icon="navigation"/>

        <transition-group
          appear
          enter-active-class="animated zoomIn"
          leave-active-class="animated zoomOut"
        >
          <q-btn key="navigation" no-wrap v-if="!controlParam.requireMapState || mapState === 'navigation' && pageMode !== 'mapPose'" rounded
                 :label="$t('amr2d_navigation_relocate')" color="primary"
                 :outline="pageMode === 'navigation'" icon="label_important_outline"
                 @click="pageMode === 'navigation'?(pageMode = 'default'):(pageMode='navigation')"/>
          <q-btn key="navigation-cancel" no-wrap v-if="pageMode==='navigation'" :label="$t('cancel')" rounded color="warning"
                 @click="robotRelocate.cancel()"/>
          <q-btn key="map-pose" no-wrap v-if="mapState === 'navigation'  && pageMode !== 'navigation'" rounded
                 :label="$t('mapPose')" color="accent"
                 :outline="pageMode === 'mapPose'" icon="grain"
                 @click="pageMode === 'mapPose'?(pageMode = 'default'):(pageMode='mapPose')"/>
          <map-create v-if="pageMode === 'default'" key="map-create"/>
          <map-selector v-if="pageMode === 'default'" key="map-selector"/>
        </transition-group>
      </div>
    </q-scroll-area>
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
