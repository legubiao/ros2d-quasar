<script setup>
import JoyStick from 'components/amr-control/JoyStick.vue'
import RosClient from 'components/amr-control/RosClient'
import { onMounted, onUnmounted } from 'vue'

const rosClient = RosClient()

onMounted(() => {
  rosClient.init()
})

onUnmounted(() => {
  rosClient.close()
})

</script>

<template>
  <div>
    <joy-stick/>
  </div>
</template>

<style scoped>

</style>
