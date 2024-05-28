<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useControlParams } from 'stores/control-params'

const robotPose = inject('robotPose')

const controlParam = useControlParams()
const pageMode = inject('pageMode')
const visible = computed(() => (pageMode.value === 'navigation'))
const clicked = ref(false)
const navFunction = ref('amr2d_relocate')
const navIcon = {
  amr2d_navigation: 'double_arrow',
  amr2d_relocate: 'play_for_work',
  amr2d_drawPath: 'route'
}

const navColor = {
  amr2d_navigation: 'primary',
  amr2d_relocate: 'accent',
  amr2d_drawPath: 'primary'
}

watch(visible, value => {
  if (value) { show() } else close()
})

watch(navFunction, () => updateNavFunction())

function updateNavFunction () {
  if (navFunction.value === 'amr2d_drawPath') {
    mapManager.drawPath = true
    mapManager.changeLocation = false
    mapManager.changeDirection = false
  } else {
    mapManager.drawPathEnd()
    mapManager.drawPath = false
    isLocation.value = true
    mapManager.changeLocation = true
  }
}

const mapManager = inject('mapManager')
const rosClient = inject('rosClient')

// 重定位置
mapManager.changePose = (pos) => {
  tempPose.value.position.x = pos.x
  tempPose.value.position.y = pos.y
  switch (navFunction.value) {
    case 'amr2d_navigation':
      mapManager.updateTargetPose(tempPose.value)
      break
    case 'amr2d_relocate':
      mapManager.updateRobotPose(tempPose.value)
      break
  }
  clicked.value = true
}

// 重定方向
mapManager.changeTheta = (pos) => {
  const theta = Math.atan2(pos.y - tempPose.value.position.y, pos.x - tempPose.value.position.x)
  tempPose.value.orientation.z = Math.sin(theta / 2)
  tempPose.value.orientation.w = Math.cos(theta / 2)
  switch (navFunction.value) {
    case 'amr2d_navigation':
      mapManager.updateTargetPose(tempPose.value)
      break
    case 'amr2d_relocate':
      mapManager.updateRobotPose(tempPose.value)
      break
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
  mapManager.drawPath = false
  mapManager.removeTarget()
  mapManager.drawPathEnd()
  if (clicked.value) {
    switch (navFunction.value) {
      case 'amr2d_navigation':
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
        break
      case 'amr2d_relocate':
        poseWithCovarianceStamped.value.pose.pose = tempPose.value
        if (controlParam.rosVersion === 'v2') {
          poseWithCovarianceStamped.value.header = { stamp: { sec: 0, nanosec: 0 }, frame_id: 'map' }
        } else {
          poseWithCovarianceStamped.value.header = { seq: 0, stamp: 0, frame_id: 'map' }
        }
        publish('/initialpose', poseWithCovarianceStamped.value)
        break
    }
  } else {
    if (navFunction.value === 'amr2d_drawPath') {
      const msg = {
        header: { stamp: { sec: 0, nanosec: 0 }, frame_id: 'map' },
        poses: mapManager.drawedPathData.map(item => {
          return {
            header: { stamp: { sec: 0, nanosec: 0 }, frame_id: '' },
            pose: {
              position: { x: item.x, y: item.y, z: 0 },
              orientation: { x: 0, y: 0, z: 0, w: 1 }
            }
          }
        })
      }
      rosClient.advertise('/amr_rctk/target_path', 'nav_msgs/Path')
      publish('/amr_rctk/target_path', msg, 'nav_msgs/Path')
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
  updateNavFunction()
}

defineExpose({ cancel })
</script>

<template>
  <q-dialog seamless v-model="visible" position="bottom">
    <div class="q-pa-sm blur">
      <div class="flex justify-center q-gutter-sm">
        <q-btn-dropdown :icon="navIcon[navFunction]" :color="navColor[navFunction]" :label="$t(navFunction)">
          <q-list>
            <q-item clickable v-close-popup @click="navFunction = 'amr2d_navigation'">
              <q-item-section avatar>
                <q-icon name="double_arrow"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('amr2d_navigation') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="navFunction = 'amr2d_relocate'">
              <q-item-section avatar>
                <q-icon name="play_for_work"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('amr2d_relocate') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="controlParam.rosVersion === 'v2'" clickable v-close-popup @click="navFunction = 'amr2d_drawPath'">
              <q-item-section avatar>
                <q-icon name="route"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('amr2d_drawPath') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn v-if="navFunction !== 'amr2d_drawPath'" class="text-bold" :label="isLocation?$t('amr2d_setPosition'):$t('amr2d_setDirection')" color="secondary" :icon-right="isLocation?'pin_drop':'rotate_90_degrees_ccw'" @click="isLocation = !isLocation"/>
      </div>
    </div>
  </q-dialog>
</template>
