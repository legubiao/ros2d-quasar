<script setup>
import { onMounted, onUnmounted, provide, ref } from 'vue'
import RosClient from 'components/ros/RosClient'
import PathTrackerPid from 'components/ros-param/PathTrackerPid.vue'

const tab = ref('pid')

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
    <q-tab-panels v-model="tab" animated style="height: calc(100vh - 100px)" class="bg-transparent">
      <PathTrackerPid name="pid"/>
    </q-tab-panels>
    <q-separator/>
    <q-tabs v-model="tab">
      <q-tab name="pid" icon="toys" label="PID控制" />
      <q-tab name="path_publisher" label="路径追踪"/>
    </q-tabs>
  </div>
</template>
