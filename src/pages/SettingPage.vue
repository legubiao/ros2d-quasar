<script setup>
import { useControlParams } from 'stores/control-params'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const controlParam = useControlParams()
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
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input v-model="controlParam.ip" :label="$t('setting_amr_ip')" outlined/>
      <q-input v-model="controlParam.cmdTopic" :label="$t('setting_topic_speed')" outlined/>
      <q-input v-model="controlParam.mapTopic" :label="$t('setting_topic_map')" outlined/>
      <q-input v-model="controlParam.arrowScale" :label="$t('setting_arrow_size')" outlined/>

      <q-select
        v-model="locale"
        :options="localeOptions"
        :label="$t('setting_language')"
        outlined
        emit-value
        map-options
      />

      <q-toggle :label="$t('setting_checkMapState')" v-model="controlParam.requireMapState"/>
    </div>
  </div>
</template>
