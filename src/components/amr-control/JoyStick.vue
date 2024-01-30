<template>
  <div ref="joystickLeft"/>
  <div ref="joystickRight"/>
  <q-page-sticky v-show="$q.screen.gt.xs" position="bottom-right" :offset="[15, 15]">
    <q-btn-dropdown color="primary" label="Joystick Params" :menu-offset="[50,8]">
      <q-card-section>
        <slider-item label="Linear Speed" input-label="linear" color="secondary" v-model="functions.linearRatio" :min="0.2"
                     :max="5"
                     :step="0.2"/>
        <slider-item label="Rotation Speed" input-label="angular" color="secondary" v-model="functions.angularRatio"
                     :min="0.1" :max="2"
                     :step="0.1"/>
        <slider-item label="Interval(ms)" input-label="interval" v-model="functions.refreshInterval" :min="25"
                     :max="100" :step="25"/>
        <q-toggle label="Keyboard Control" v-model="functions.keyboardMove" @click="setKeyboard"/>
      </q-card-section>
    </q-btn-dropdown>
  </q-page-sticky>
</template>

<script>
import { inject, ref, onMounted, onUnmounted } from 'vue'
import nipplejs from 'nipplejs'

import { useControlParams } from 'stores/control-params'

import SliderItem from 'components/setting/SliderItem.vue'

export default {
  name: 'JoyStick',
  components: { SliderItem },
  setup () {
    const publish = inject('publish')

    const twist = ref({
      linear: { x: 0, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0 }
    })

    const connected = inject('connected')
    let moving = true
    function pubVel (x, z) {
      if (connected.value) {
        if (x || z) {
          moving = true
          twist.value.linear.x = x
          twist.value.angular.z = z
          publish('/cmd_vel', twist.value)
        } else {
          if (moving) {
            moving = false
            twist.value.linear.x = x
            twist.value.angular.z = z
            publish('/cmd_vel', twist.value)
          }
        }
      }
    }

    const joystickLeft = ref()
    const joystickRight = ref()
    const managerLeft = ref(null)
    const managerRight = ref(null)
    const linear = ref(0)
    const angular = ref(0)

    const controlParams = useControlParams()

    function initLeftJoyStick () {
      const options = {
        zone: joystickLeft.value,
        mode: 'static', // mode: 'semi','dynamic'
        position: { left: '100px', bottom: '100px' },
        lockY: true,
        color: 'blue',
        size: 80
      }
      managerLeft.value = nipplejs.create(options)
      managerLeft.value.on('start end', function () {
        linear.value = 0
      }).on('move', function (evt, data) {
        linear.value = data.vector.y * controlParams.linearRatio
      })
    }

    function initRightJoyStick () {
      const options = {
        zone: joystickRight.value,
        mode: 'static', // mode: 'semi','dynamic'
        position: { right: '100px', bottom: '100px' },
        lockX: true,
        color: 'green',
        size: 80
      }
      managerRight.value = nipplejs.create(options)
      managerRight.value.on('end', function () {
        angular.value = 0
      }).on('move', function (evt, data) {
        angular.value = -(data.vector.x * controlParams.angularRatio)
      })
    }

    /**
     * 设置键盘方向键控制机器人运动
     */
    function setKeyboard () {
      if (controlParams.keyboardMove) {
        document.onkeydown = (e) => {
          console.log(e)
          switch (e.code) {
            case 'ArrowUp':
              linear.value = controlParams.linearRatio
              break
            case 'ArrowDown':
              linear.value = -controlParams.linearRatio
              break
            case 'ArrowLeft':
              angular.value = controlParams.angularRatio
              break
            case 'ArrowRight':
              angular.value = -controlParams.angularRatio
              break
          }
        }
        document.onkeyup = (e) => {
          switch (e.code) {
            case 'ArrowDown':
            case 'ArrowUp':
              linear.value = 0
              break
            case 'ArrowLeft':
            case 'ArrowRight':
              angular.value = 0
              break
          }
        }
      } else {
        document.onkeyup = null
        document.onkeydown = null
      }
    }

    let timer

    // 初始化加载手柄
    onMounted(() => {
      initRightJoyStick()
      initLeftJoyStick()
      setKeyboard()
      timer = setInterval(() => {
        pubVel(linear.value, angular.value)
      }, controlParams.refreshInterval)
    })

    onUnmounted(() => {
      clearInterval(timer)
      document.onkeyup = null
      document.onkeydown = null
    })
    return {
      joystickLeft,
      joystickRight,
      functions: controlParams,
      setKeyboard
    }
  }
}
</script>
