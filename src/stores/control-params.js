import { defineStore } from 'pinia'

export const useControlParams = defineStore('counter', {
  state: () => ({
    locale: 'en-US',
    linearRatio: 0.5,
    linearMax: 1,
    refreshInterval: 50,
    angularRatio: 0.5,
    keyboardMove: false,
    moveMode: '2wheeled',
    ip: 'localhost',
    cmdTopic: '/cmd_vel',
    mapTopic: '/map',
    rosVersion: 'v1',

    requireMapState: true,
    arrowScale: 1,
    poseSize: 0.5
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
          'requireMapState',
          'locale',
          'ip',
          'linearRatio',
          'linearMax',
          'refreshInterval',
          'angularRatio',
          'keyboardMove',
          'moveMode',
          'cmdTopic',
          'mapTopic',
          'rosVersion',
          'arrowScale',
          'poseSize'
        ]
      }
    ]
  }
})
