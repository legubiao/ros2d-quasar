<template>
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="handleClick(link)"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'RouterItem',
  props: {
    title: {
      type: String
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    }
  },
  setup (props, context) {
    const router = useRouter()
    return {
      handleClick (target) {
        context.emit('close-drawer')
        router.push(target)
      }
    }
  }
}
</script>
