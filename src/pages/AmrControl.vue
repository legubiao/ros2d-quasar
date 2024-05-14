<script setup>
import JoyStick from 'components/ros/JoyStick.vue'
import RosClient from 'components/ros/RosClient'
import { computed, onMounted, onUnmounted, provide } from 'vue'
import RosMap2d from 'components/amr-control/RosMap2d.vue'

const rosClient = RosClient()
provide('rosClient', rosClient)
const visible = computed(() => rosClient.mapState && rosClient.mapState.value === 'terminating')

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
    <q-inner-loading
      :showing="visible"
      :label="$t('amr2d_wait')"
      label-class="text-teal"
      size="5rem"
      color="teal"
      label-style="font-size: 3em"
    />
  </div>
</template>
