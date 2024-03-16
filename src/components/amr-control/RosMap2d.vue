<script setup>

import { inject, provide, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'

import RosMapPixi from 'components/amr-control/RosMapPixi'
import RobotRelocate from 'components/amr-control/RobotRelocate.vue'

const $q = useQuasar()

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
    title: '保存地图',
    message: '请输入地图的名字',
    prompt: {
      model: '',
      type: 'text' // optional
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    mapCommand('save ' + data)
  })
}

function loadMap () {
  $q.dialog({
    title: '加载地图',
    message: '请输入地图的名字',
    prompt: {
      model: '',
      type: 'text' // optional
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    mapCommand('load ' + data)
  })
}

</script>

<template>
  <q-page-sticky position="top" :offset="[15, 15]">
    <div class="row q-gutter-sm">
      <q-btn round @click="mapManager.focus" color="primary" icon="navigation"/>
      <q-btn rounded label="定位与导航" color="primary" icon="pin_drop" @click="isRelocating = !isRelocating"/>
      <q-btn label="创建地图" color="secondary" @click="mapCommand('start')"/>
      <q-btn label="保存地图" color="primary" icon="save" @click="saveMap"/>
      <q-btn label="加载地图" color="primary" icon="download" @click="loadMap"/>
    </div>
  </q-page-sticky>
  <canvas ref="pixiContainer" class="full-width full-height"/>
  <RobotRelocate/>
</template>
