<script setup>

import { inject, onMounted, ref, watch } from 'vue'
import * as PIXI from 'pixi.js'

const rosClient = inject('rosClient')
const connected = inject('connected')

watch(connected, value => {
  if (value) {
    rosClient.subscribe('/map')
  }
})

let pixiApp
const pixiContainer = ref(null)

const loadMapRaw = inject('loadMapRaw')

onMounted(() => {
  pixiApp = new PIXI.Application({
    width: pixiContainer.value.offsetWidth,
    height: pixiContainer.value.offsetHeight,
    backgroundColor: '#1099bb',
    view: pixiContainer.value
  })

  loadMapRaw.value = function (data) {
    const texture = PIXI.Texture.fromBuffer(
      new Uint8Array(data.data.map(x => {
        switch (x) {
          case 100: return [0, 0, 0, 255]
          case 0: return [255, 255, 255, 255]
          default: return [127, 127, 127, 255]
        }
      }).flat()),
      data.info.width,
      data.info.height
    )

    const sprite = new PIXI.Sprite(texture)
    pixiApp.stage.addChild(sprite)
  }
})

</script>

<template>
  <canvas ref="pixiContainer" class="full-width full-height"/>
</template>

<style scoped>

</style>
