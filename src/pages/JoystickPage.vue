<script setup>

import RosClient from 'components/ros/RosClient'
import { onMounted, onUnmounted, provide } from 'vue'
import JoyStick from 'components/ros/JoyStick.vue'

const rosClient = RosClient()
provide('rosClient', rosClient)

onMounted(() => {
  rosClient.init()
})

onUnmounted(() => {
  rosClient.close()
})
</script>

<template>
  <div>
    <joy-stick toggle-position="bottom" :visible-switch="false"/>
  </div>
</template>
