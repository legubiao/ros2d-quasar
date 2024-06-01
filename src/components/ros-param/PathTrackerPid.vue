<script setup>

import SliderItem from 'components/setting/SliderItem.vue'
import { inject, onMounted, ref, watch } from 'vue'

const kp = ref(0)
const ki = ref(0)
const kd = ref(0)
const stanleyK = ref(0)
const speedTarget = ref(0)
const rosClient = inject('rosClient')
const connected = inject('connected')

watch(connected, () => {
  if (connected.value) {
    getParams()
  }
})

onMounted(() => {
  if (connected.value) getParams()
})

function getParams () {
  rosClient.getParams('/amr_rctk/path_tracker_pid', ['pid_kp', 'pid_ki', 'pid_kd', 'stanley_k', 'speed_target']).then(rs => {
    kp.value = rs.values[0].double_value
    ki.value = rs.values[1].double_value
    kd.value = rs.values[2].double_value
    stanleyK.value = rs.values[3].double_value
    speedTarget.value = rs.values[4].double_value
  })
}

function handleEnd (data, type) {
  rosClient.setParam('/amr_rctk/path_tracker_pid', type, data).then(() => {
    getParams()
  })
}

</script>

<template>
  <q-tab-panel name="pid">
    <slider-item label="Kp" v-model="kp" :min="0" :max="10" :step="0.1" @changed="value => handleEnd(value, 'pid_kp')"/>
    <slider-item label="Ki" v-model="ki" :min="0" :max="10" :step="0.1" @changed="value => handleEnd(value, 'pid_ki')"/>
    <slider-item label="Kd" v-model="kd" :min="0" :max="10" :step="0.1" @changed="value => handleEnd(value, 'pid_kd')"/>
    <slider-item label="Stanley K" v-model="stanleyK" :min="0" :max="10" :step="0.1" @changed="value => handleEnd(value, 'stanley_k')"/>
    <slider-item label="Speed Target" v-model="speedTarget" :min="0.1" :max="1.0" :step="0.01" @changed="value => handleEnd(value, 'speed_target')"/>
  </q-tab-panel>
</template>
