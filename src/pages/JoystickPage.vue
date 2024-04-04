<script setup>

import RosClient from 'components/amr-control/RosClient'
import { onMounted, onUnmounted, provide } from 'vue'
import JoyStick from 'components/amr-control/JoyStick.vue'

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
    <joy-stick toggle-position="bottom"/>
  </div>
</template>

<style scoped>

</style>
