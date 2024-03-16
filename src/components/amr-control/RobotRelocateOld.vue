<template>
  <q-dialog seamless v-model="visible" position="bottom">
    <div class="q-pa-sm blur">
      <div class="flex justify-center q-gutter-sm">
        <q-btn class="text-bold" label="结束定位" color="secondary" icon-right="location_off" @click="close"/>
        <q-btn class="text-bold" :label="isLocation?'当前模式：修改位置':'当前模式：修改方向'" color="secondary" :icon-right="isLocation?'replay':'shuffle'" @click="changeMode()"/>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { computed, inject, ref, watch } from 'vue'
import { api } from 'boot/axios'
import { useAPIStore } from 'stores/api/index.js'
import { useQuasar } from 'quasar'

export default {
  name: 'RobotRelocate',
  setup () {
    const visible = inject('isRelocating')
    const isLocation = ref(true)
    const $q = useQuasar()

    const pixiMap = inject('pixiMap')

    // 修改模式
    function changeMode () {
      isLocation.value = !isLocation.value
    }
    watch(isLocation, value => {
      pixiMap.changeLocation = false
      pixiMap.changeDirection = false
      if (value) {
        pixiMap.changeLocation = true
      } else {
        pixiMap.changeDirection = true
      }
    })

    const publish = inject('publish')
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

    // 重定位开启
    const robotPose = inject('robotPose')
    // 临时坐标
    const tempPose = ref({})

    // 监听是否开启重定位
    watch(visible, value => {
      if (!value) { // 退出时关闭重定位及方向
        pixiMap.changeLocation = false
        pixiMap.changeDirection = false
      }
    })

    // 定位至充电桩
    const pointList = inject('pointList')
    const chargerPose = computed(() => pointList.value.filter(item => { return item.type === 'charger' }))

    return {
      visible,
      isLocation,
      changeMode,
      chargerPose,
      show () {
        tempPose.value = robotPose.value
        // 重定位置
        pixiMap.changePose = (pos) => {
          tempPose.value.position.x = pos.x
          tempPose.value.position.y = pos.y
          pixiMap.updateRobot(tempPose.value)
        }
        // 重定方向
        pixiMap.changeTheta = (pos) => {
          const theta = Math.atan2(pos.y - tempPose.value.position.y, pos.x - tempPose.value.position.x)
          tempPose.value.orientation.z = Math.sin(theta / 2)
          tempPose.value.orientation.w = Math.cos(theta / 2)
          pixiMap.updateRobot(tempPose.value)
        }
        visible.value = true
        pixiMap.changeLocation = true
      },
      close () {
        poseWithCovarianceStamped.value.header.seq++
        poseWithCovarianceStamped.value.pose.pose = tempPose.value
        publish('/initialpose', poseWithCovarianceStamped.value)
        visible.value = false
        $q.dialog({
          title: '自动校正',
          message: '是否要自动校正机器人位置？',
          cancel: true,
          persistent: true
        }).onOk(() => {
          setTimeout(() => {
            api.post(useAPIStore().amrRosUrl + 'call', [], { params: { service: '/correct_robot_pose' } }).then(rs => {
              console.log(rs.data)
              if (rs.data.values.success) {
                $q.notify({ message: '纠正成功', type: 'positive' })
              } else {
                $q.notify({ message: 'ROS调用失败', type: 'negative' })
              }
            })
          }, 2000)
        })
      }
    }
  }
}
</script>
