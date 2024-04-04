<script setup>
import RosClient from 'components/ros/RosClient'
import { onMounted, onUnmounted, provide, ref } from 'vue'

const rosClient = RosClient()
provide('rosClient', rosClient)

onMounted(() => {
  rosClient.init()
})

onUnmounted(() => {
  rosClient.close()
})

const splitterModel = ref(50)

const serviceName = ref('/get_map_files')
const serviceContent = ref('')

const serviceResponse = ref({})

async function call () {
  const response = await rosClient.call(serviceName.value, serviceContent.value)
  serviceResponse.value = response.values
}

</script>

<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      :limits="[50, 100]"
    >

      <template v-slot:before>
        <div class="q-pa-md q-gutter-y-md">
          <div class="text-h4 q-mb-md">Before</div>
          <q-input outlined  label="service_name" v-model="serviceName">
            <template v-slot:append>
              <q-btn label="service_call" color="primary" @click="call"/>
            </template>
          </q-input>
          <q-input outlined  label="service_content" v-model="serviceContent"/>
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-md">
          <div class="text-h4 q-mb-md">After</div>
          <div>{{serviceResponse}}</div>
        </div>
      </template>

    </q-splitter>
  </div>
</template>

<style scoped>

</style>
