import { defineStore } from 'pinia'

export const useControlParams = defineStore('counter', {
  state: () => ({
    locale: 'en-US',
    linearRatio: 0.5,
    refreshInterval: 50,
    angularRatio: 0.5,
    keyboardMove: false,
    moveMode: '2wheeled',
    ip: 'localhost',
    cmdTopic: '/cmd_vel',
    arrowScale: 1
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
          'locale',
          'ip',
          'linearRatio',
          'refreshInterval',
          'angularRatio',
          'keyboardMove',
          'moveMode',
          'cmdTopic',
          'arrowScale'
        ]
      }
    ]
  }
})
