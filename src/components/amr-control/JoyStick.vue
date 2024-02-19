<script setup>
import { getCssVar } from 'quasar'
import { inject, onMounted, onUnmounted, ref } from 'vue'
import { useControlParams } from 'stores/control-params'
import nipplejs from 'nipplejs'
import SliderItem from 'components/setting/SliderItem.vue'

const left = ref()
const right = ref()

// Linear and Angular speed
const linear = ref(0)
const angular = ref(0)

const controlParams = useControlParams()

/**
 * Use Nipple-js to create virtual joysticks
 */
function initJoyStick () {
  nipplejs.create({
    zone: left.value,
    mode: 'static', // mode: 'semi','dynamic'
    position: { left: '100px', bottom: '100px' },
    lockY: true,
    color: getCssVar('negative'),
    size: 80
  }).on('start end', function () {
    linear.value = 0
  }).on('move', function (evt, data) {
    linear.value = data.vector.y * controlParams.linearRatio
  })

  nipplejs.create({
    zone: right.value,
    mode: 'static', // mode: 'semi','dynamic'
    position: { right: '100px', bottom: '100px' },
    lockX: true,
    color: getCssVar('negative'),
    size: 80
  }).on('end', function () {
    angular.value = 0
  }).on('move', function (evt, data) {
    angular.value = -(data.vector.x * controlParams.angularRatio)
  })
}

const connected = inject('connected')
const publish = inject('publish')
let moving = true
const twist = ref({
  linear: { x: 0, y: 0, z: 0 },
  angular: { x: 0, y: 0, z: 0 }
})

/**
 * Publish twist to /cmd_vel
 * @param x Linear Speed
 * @param z Angular Speed
 */
function pubVel (x, z) {
  if (!connected.value) return
  if (x || z) {
    moving = true
    twist.value.linear.x = x
    twist.value.angular.z = z
    publish(controlParams.cmdTopic, twist.value)
  } else {
    if (moving) {
      moving = false
      twist.value.linear.x = x
      twist.value.angular.z = z
      publish(controlParams.cmdTopic, twist.value)
    }
  }
}

function initKeyboardCtrl () {
  if (controlParams.keyboardMove) {
    document.onkeydown = (e) => {
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

/**
 * Create Timer to publish velocity
 */
let timer
onMounted(() => {
  initJoyStick()
  initKeyboardCtrl()
  timer = setInterval(() => {
    pubVel(linear.value, angular.value)
  }, controlParams.refreshInterval)
})

onUnmounted(() => {
  clearInterval(timer)
  document.onkeyup = null
  document.onkeydown = null
})

</script>

<template>
  <div ref="left"/>
  <div ref="right"/>
  <q-page-sticky v-show="$q.screen.gt.xs" position="bottom-right" :offset="[15, 15]">
    <q-btn-dropdown color="primary" label="Joystick Params" :menu-offset="[50,8]">
      <q-card-section>
        <slider-item label="Linear Speed" input-label="linear" color="secondary" v-model="controlParams.linearRatio" :min="0.05"
                     :max="1"
                     :step="0.05"/>
        <slider-item label="Rotation Speed" input-label="angular" color="secondary" v-model="controlParams.angularRatio"
                     :min="0.1" :max="2"
                     :step="0.1"/>
        <slider-item label="Interval(ms)" input-label="interval" v-model="controlParams.refreshInterval" :min="25"
                     :max="100" :step="25"/>
        <q-toggle label="Keyboard Control" v-model="controlParams.keyboardMove" @click="initKeyboardCtrl"/>
      </q-card-section>
    </q-btn-dropdown>
  </q-page-sticky>
</template>
