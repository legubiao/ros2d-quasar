import { defineStore } from 'pinia'

export const useControlParams = defineStore('counter', {
  state: () => ({
    linearRatio: 0.4,
    refreshInterval: 50,
    angularRatio: 0.2,
    keyboardMove: false,
    moveMode: '2wheeled',
    ip: 'localhost'
  }),

  getters: {
    rosUrl: state => 'ws://' + state.ip + ':9090'
  },

  actions: {
  },
  // 开启数据缓存
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'control-params',
        storage: localStorage,
        paths: [
          'ip',
          'linearRatio',
          'refreshInterval',
          'angularRatio',
          'keyboardMove',
          'moveMode'
        ]
      }
    ]
  }
})
