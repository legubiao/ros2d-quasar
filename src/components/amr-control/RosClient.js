import { provide, ref } from 'vue'
import { Notify } from 'quasar'
import { useControlParams } from 'stores/control-params'

export default function RosClient () {
  const connected = ref(false)
  const url = useControlParams().rosUrl
  let ws = null
  const rosClient = {
    robotPose: ref({}),
    loadMapData: ref(function (data) {}),
    loadMapRaw: ref(function (data) {}),
    scanPose: ref([])
  }

  let alive = true

  /**
   * 创建与ROS的WebSocket连接
   */
  const createWs = () => {
    ws = new WebSocket(url)
    initWs()
  }

  let rec
  /**
   * 重连函数
   */
  const reConnect = () => {
    console.log('尝试重连')
    if (connected.value || !alive) return
    rec && clearTimeout(rec)
    rec = setTimeout(createWs, 5000)
  }

  /**
   * 设置心跳
   */
  const heartCheck = {
    timeoutObj: null,
    start: () => {
      heartCheck.timeoutObj = setTimeout(function () {
        if (!connected.value && alive) reConnect()
      }, 10000)
    },
    reset: () => {
      clearTimeout(heartCheck.timeoutObj)
      heartCheck.start()
    }
  }

  /**
   * 初始化WebSocket
   */
  const initWs = () => {
    ws.onclose = () => {
      connected.value = false
    }

    ws.onerror = () => {
      connected.value = false
      reConnect()
    }

    ws.onopen = () => {
      connected.value = true
      heartCheck.start()
      Notify.create({ type: 'positive', message: '已建立与ROS的直连' })
    }

    ws.onmessage = (e) => {
      heartCheck.reset()
      const resData = JSON.parse(e.data)
      switch (resData.op.valueOf()) {
        case 'publish':
          processTopic(resData)
          break
      }
    }
  }

  function processTopic (rosObject) {
    switch (rosObject.topic) {
      case '/robot_pose':rosClient.robotPose.value = rosObject.msg; break
      case '/map_metadata': rosClient.loadMapData.value(rosObject.msg); break
      case '/map': rosClient.loadMapRaw.value(rosObject.msg); break
      case '/scan_simplified': rosClient.scanPose.value = rosObject.msg.polygon !== undefined ? rosObject.msg.polygon.points !== undefined ? rosObject.msg.polygon.points : [] : []; break
    }
  }

  function wsSend (object) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(object))
    } else {
      if (connected.value) {
        setTimeout(() => wsSend(object), 200)
      }
    }
  }

  rosClient.subscribe = (topic) => { wsSend({ op: 'subscribe', topic }) }
  rosClient.unsubscribe = (topic) => { wsSend({ op: 'unsubscribe', topic }) }
  rosClient.publish = (topic, msg) => { wsSend({ op: 'publish', topic, msg }) }
  rosClient.close = () => {
    Notify.create({ type: 'info', message: '已释放与ROS的直连' })
    alive = false
    connected.value = false
    ws.close()
  }
  rosClient.init = createWs

  provide('robotPose', rosClient.robotPose)
  provide('loadMapData', rosClient.loadMapData)
  provide('loadMapRaw', rosClient.loadMapRaw)
  provide('subscribe', rosClient.subscribe)
  provide('unsubscribe', rosClient.unsubscribe)
  provide('publish', rosClient.publish)
  provide('connected', connected)

  return rosClient
}
