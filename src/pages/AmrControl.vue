<script setup>
import JoyStick from 'components/ros/JoyStick.vue'
import RosClient from 'components/ros/RosClient'
import { onMounted, onUnmounted, provide } from 'vue'
import RosMap2d from 'components/amr-control/RosMap2d.vue'

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
    <ros-map2d/>
    <joy-stick/>
  </div>
</template>

<style scoped>

</style>
