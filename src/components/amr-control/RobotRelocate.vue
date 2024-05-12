<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useControlParams } from 'stores/control-params'

const robotPose = inject('robotPose')

const controlParam = useControlParams()
const pageMode = inject('pageMode')
const visible = computed(() => (pageMode.value === 'navigation'))
const clicked = ref(false)

watch(visible, value => {
  if (value) { show() } else close()
})

const mapManager = inject('mapManager')
const rosClient = inject('rosClient')

// 重定位置
mapManager.changePose = (pos) => {
  console.log(tempPose.value)
  tempPose.value.position.x = pos.x
  tempPose.value.position.y = pos.y
  if (isNavigate.value) {
    mapManager.updateTargetPose(tempPose.value)
  } else {
    mapManager.updateRobotPose(tempPose.value)
  }
  clicked.value = true
}

// 重定方向
mapManager.changeTheta = (pos) => {
  const theta = Math.atan2(pos.y - tempPose.value.position.y, pos.x - tempPose.value.position.x)
  tempPose.value.orientation.z = Math.sin(theta / 2)
  tempPose.value.orientation.w = Math.cos(theta / 2)
  if (isNavigate.value) {
    mapManager.updateTargetPose(tempPose.value)
  } else {
    mapManager.updateRobotPose(tempPose.value)
  }
  clicked.value = true
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
  header: {},
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
  mapManager.removeTarget()

  if (clicked.value) {
    if (isNavigate.value) {
      if (controlParam.rosVersion === 'v1') {
        rosClient.publish('/move_base_simple/goal', {
          header: { seq: 0, stamp: 0, frame_id: 'map' },
          pose: tempPose.value
        })
      } else {
        rosClient.publish('/goal_pose', {
          header: { stamp: { sec: 0, nanosec: 0 }, frame_id: 'map' },
          pose: tempPose.value
        })
      }
    } else {
      poseWithCovarianceStamped.value.pose.pose = tempPose.value
      if (controlParam.rosVersion === 'v2') {
        poseWithCovarianceStamped.value.header = { stamp: { sec: 0, nanosec: 0 }, frame_id: 'map' }
      } else {
        poseWithCovarianceStamped.value.header = { seq: 0, stamp: 0, frame_id: 'map' }
      }
      publish('/initialpose', poseWithCovarianceStamped.value)
    }
  }
}

function cancel () {
  clicked.value = false
  pageMode.value = 'default'
  publish('/move_base/cancel', {})
  mapManager.clearPath()
}

function show () {
  if (robotPose.value.pose) {
    tempPose.value = robotPose.value.pose
  }
  mapManager.changeLocation = true
  clicked.value = false
}

defineExpose({ cancel })
</script>

<template>
  <q-dialog seamless v-model="visible" position="bottom">
    <div class="q-pa-sm blur">
      <div class="flex justify-center q-gutter-sm">
        <q-btn class="text-bold" :label="isNavigate?$t('amr2d_navigation'):$t('amr2d_relocate')" :color="isNavigate?'primary':'accent'" :icon-right="isNavigate?'double_arrow':'play_for_work'" @click="isNavigate = !isNavigate"/>
        <q-btn class="text-bold" :label="isLocation?$t('amr2d_setPosition'):$t('amr2d_setDirection')" color="secondary" :icon-right="isLocation?'pin_drop':'rotate_90_degrees_ccw'" @click="isLocation = !isLocation"/>
      </div>
    </div>
  </q-dialog>
</template>
