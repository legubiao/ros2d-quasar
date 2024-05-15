import { defineStore } from 'pinia'

export const useVisualization = defineStore('visualization', {
  state: () => ({
    pathEnable: true,
    pathTopic: '/move_base/NavfnROS/plan',
    trajectoryEnable: false,
    trajectoryTopic: '/robot_path',
    laserScanEnable: false,
    laserScanTopic: '/scan',
    costMapEnable: false,
    costMapTopic: '/local_costmap/costmap'
  }),
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'visualization',
        storage: localStorage,
        paths: [
          'pathEnable',
          'pathTopic',
          'trajectoryEnable',
          'trajectoryTopic',
          'laserScanEnable',
          'laserScanTopic',
          'costMapEnable',
          'costMapTopic'
        ]
      }
    ]
  }
})
