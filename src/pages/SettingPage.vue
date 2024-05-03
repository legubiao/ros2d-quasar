<script setup>
import { useControlParams } from 'stores/control-params'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { useVisualization } from 'stores/visualization'

const controlParam = useControlParams()
const visualizations = useVisualization()
const { locale } = useI18n({ useScope: 'global' })
const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-CN', label: '中文' }
]

watch(locale, value => {
  controlParam.locale = value
})

</script>

<template>
  <q-scroll-area>
    <div class="q-gutter-y-md q-pa-md rounded-borders">
      <q-input v-model="controlParam.ip" :label="$t('setting_amr_ip')" outlined/>
      <q-input v-model="controlParam.cmdTopic" :label="$t('setting_topic_speed')" outlined/>
      <q-input v-model="controlParam.mapTopic" :label="$t('setting_topic_map')" outlined/>
      <q-input v-model="controlParam.arrowScale" :label="$t('setting_arrow_size')" outlined/>
      <q-input v-model="controlParam.linearMax" type="number" :label="$t('setting_linear_limit')" outlined/>

      <q-select
        v-model="locale"
        :options="localeOptions"
        :label="$t('setting_language')"
        outlined
        emit-value
        map-options
      />

      <q-toggle :label="$t('setting_checkMapState')" v-model="controlParam.requireMapState"/>

      <q-list bordered class="rounded-borders">
        <q-expansion-item>
          <template v-slot:header>
            <q-toggle v-model="visualizations.laserScanEnable" icon="wifi_tethering"/>
            <q-item-section>
              {{ $t('setting_laser_scan') }}
            </q-item-section>
          </template>
          <q-separator />
          <q-card-section>
            <q-input v-model="visualizations.laserScanTopic" :label="$t('setting_laser_scan_topic')" outlined/>
          </q-card-section>
        </q-expansion-item>
        <q-expansion-item>
          <template v-slot:header>
            <q-toggle v-model="visualizations.pathEnable" icon="route"/>
            <q-item-section>
              {{ $t('setting_path') }}
            </q-item-section>
          </template>
          <q-separator />
          <q-card-section>
            <q-input v-model="visualizations.pathTopic" :label="$t('setting_path_topic')" outlined/>
          </q-card-section>
        </q-expansion-item>
        <q-expansion-item>
          <template v-slot:header>
            <q-toggle v-model="visualizations.trajectoryEnable" icon="timeline" color="secondary"/>
            <q-item-section>
              {{ $t('setting_trajectory') }}
            </q-item-section>
          </template>
          <q-separator />
          <q-card-section>
            <q-input v-model="visualizations.trajectoryTopic" :label="$t('setting_trajectory_topic')" outlined/>
          </q-card-section>
        </q-expansion-item>
      </q-list>
    </div>
  </q-scroll-area>
</template>
