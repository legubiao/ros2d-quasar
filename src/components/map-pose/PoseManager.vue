<script setup>

import { computed, inject, ref, watch } from 'vue'

const pageMode = inject('pageMode')
const rosClient = inject('rosClient')
const visible = computed(() => (pageMode.value === 'mapPose'))
const robotPose = inject('robotPose')
const poseList = ref([])
const mapManager = inject('mapManager')
const publish = inject('publish')

watch(visible, value => {
  if (value) { poseCommand('load') } else {
    mapManager.loadPoseList([])
  }
})

async function poseCommand (command) {
  const response = await rosClient.call('/pose_list', [command])
  if (response.values.success) {
    poseList.value = response.values.poses
    mapManager.loadPoseList(poseList.value)
  }
}

async function addPose (pose) {
  const response = await rosClient.call('/pose_list', ['add', pose])
  poseList.value = response.values.poses
  mapManager.loadPoseList(poseList.value)
}

const selected = ref('')
function choose (pose) {
  selected.value = pose.header.seq
  mapManager.changePoseColor(pose.header.seq)
  publish('/move_base_simple/goal', pose)
}

</script>

<template>
  <q-dialog v-model="visible" seamless :position="$q.screen.lt.sm?'top':'right'">
    <q-card>
      <q-card-section class="text-h6">
        {{$t('mapPose_title')}}
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <q-list bordered separator dense style="overflow: auto; max-height: 30vh">
          <q-item v-for="(item, index) in poseList" v-bind:key="index" @click="choose(item)" clickable v-ripple :active="selected === item.header.seq" active-class="bg-teal-5 text-white">
            <q-item-section>{{ item.header.seq }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog seamless v-model="visible" position="bottom">
    <div class="q-pa-sm blur">
      <div class="flex justify-center q-gutter-sm">
        <q-btn label="addPoseOnRobot" icon="add" color="primary" @click="addPose(robotPose)"/>
        <q-btn label="savePose" icon="save" color="secondary" @click="poseCommand('save')"/>
        <q-btn label="refresh" icon="sync" color="primary" @click="poseCommand('load')"/>
      </div>
    </div>
  </q-dialog>
</template>
