<template>
  <q-item>
    <q-item-section>
      <q-badge :color="color">
        {{ label }}: {{ modelValue }} ({{ min }} to {{ max }}, step {{ step }})
      </q-badge>
      <q-slider
        :color="color"
        markers
        snap
        :step="step"
        :min="min"
        :max="max"
        :model-value="modelValue"
        @update:model-value="updateValue"
        @change="changed"/>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'SliderItem',
  props: {
    color: { type: String, default: 'primary' },
    label: { type: String, default: '服务' },
    modelValue: Number,
    min: Number,
    max: Number,
    step: Number
  },
  setup (prop, context) {
    function updateValue (value) {
      context.emit('update:modelValue', value)
    }
    function changed (value) {
      context.emit('changed', value)
    }
    return {
      updateValue,
      changed
    }
  }
}
</script>
