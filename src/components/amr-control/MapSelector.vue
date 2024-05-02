<script setup>
import { inject, ref } from 'vue'

const visible = ref(false)
const rosClient = inject('rosClient')
const publish = inject('publish')

const maps = ref([])
const mapId = ref('')
async function show () {
  const response = await rosClient.call('/get_map_files', '')
  if (response.values.message) {
    maps.value = response.values.message.split(',').map(item => { return { label: item, value: item } })
  }
  visible.value = true
}

function selectMap () {
  publish('/map_command', { data: 'load ' + mapId.value })
  visible.value = false
}

</script>

<template>
  <q-btn no-wrap rounded :label="$t('amr2d_loadMap')" color="primary" icon="download" @click="show">
    <q-dialog v-model="visible" persistent>
      <q-card>
        <q-card-section class="text-h6" style="min-width: 20rem">
          <div>{{ $t('amr2d_loadMap') }}</div>
          <q-space/>
        </q-card-section>
        <q-separator/>
        <q-card-section v-if="maps.length === 0" class="text-subtitle1 text-grey-7 text-bold">
          {{$t('amr2d_loadMap_empty')}}
        </q-card-section>
        <q-card-section v-else>
          <q-option-group
            :options="maps"
            type="radio"
            v-model="mapId"
          />
        </q-card-section>
        <q-separator/>
        <q-card-section class="text-right q-pa-sm">
          <q-btn color="secondary" flat v-close-popup :label="$t('cancel')"/>
          <q-btn color="primary" flat @click="selectMap" :label="$t('ok')" class="text-bold"/>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-btn>
</template>
