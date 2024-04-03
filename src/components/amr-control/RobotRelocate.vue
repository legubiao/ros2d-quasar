<script setup>
import { inject, ref, watch } from 'vue'

const robotPose = inject('robotPose')

const visible = inject('isRelocating')
watch(visible, value => {
  if (value) { show() } else close()
})

const mapManager = inject('mapManager')
// 重定位置
mapManager.changePose = (pos) => {
  tempPose.value.position.x = pos.x
  tempPose.value.position.y = pos.y
  mapManager.updateRobotPose(tempPose.value)
}
// 重定方向
mapManager.changeTheta = (pos) => {
  const theta = Math.atan2(pos.y - tempPose.value.position.y, pos.x - tempPose.value.position.x)
  tempPose.value.orientation.z = Math.sin(theta / 2)
  tempPose.value.orientation.w = Math.cos(theta / 2)
  mapManager.updateRobotPose(tempPose.value)
}

const isLocation = ref(true)
watch(isLocation, value => {
  mapManager.changeLocation = false
  mapManager.changeDirection = false
  if (value) {
    mapManager.changeLocation = true
  } else {
    mapManager.changeDirection = true
  }
})

const isNavigate = ref(false)

const poseWithCovarianceStamped = ref({
  header: { seq: 0, stamp: 0, frame_id: 'map' },
  pose: {
    pose: {
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 0, w: 1 }
    },
    covariance: [0.01, 0, 0, 0, 0, 0,
      0, 0.01, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0.1]
  }
})

const tempPose = ref({
  position: { x: 0, y: 0, z: 0 },
  orientation: { x: 0, y: 0, z: 0, w: 1 }
})

const publish = inject('publish')
function close () {
  mapManager.changeLocation = false
  mapManager.changeDirection = false

  if (isNavigate.value) {
    publish('/move_base_simple/goal', {
      header: { seq: 0, stamp: 0, frame_id: 'map' },
      pose: tempPose.value
    })
  } else {
    poseWithCovarianceStamped.value.header.seq++
    poseWithCovarianceStamped.value.pose.pose = tempPose.value
    publish('/initialpose', poseWithCovarianceStamped.value)
  }
}

function show () {
  tempPose.value = robotPose.value.pose
  mapManager.changeLocation = true
}
</script>

<template>
  <q-dialog seamless v-model="visible" position="bottom">
    <div class="q-pa-sm blur">
      <div class="flex justify-center q-gutter-sm">
        <q-btn class="text-bold" :label="isNavigate?$t('amr2d_navigation'):$t('amr2d_relocate')" color="primary" :icon-right="isNavigate?'double_arrow':'play_for_work'" @click="isNavigate = !isNavigate"/>
        <q-btn class="text-bold" :label="isLocation?$t('amr2d_setPosition'):$t('amr2d_setDirection')" color="secondary" :icon-right="isLocation?'pin_drop':'rotate_90_degrees_ccw'" @click="isLocation = !isLocation"/>
      </div>
    </div>
  </q-dialog>
</template>
