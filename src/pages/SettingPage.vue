<script setup>
import { useControlParams } from 'stores/control-params'

const controlParam = useControlParams()
</script>

<template>
  <div class="q-pa-md">
    <q-input v-model="controlParam.ip" label="AMR IP" outlined/>
  </div>
</template>

<style scoped>

</style>
