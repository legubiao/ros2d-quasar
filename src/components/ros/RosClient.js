import { provide, ref } from 'vue'
import { Notify } from 'quasar'
import { useControlParams } from 'stores/control-params'
import { useI18n } from 'vue-i18n'
import { v4 as uuidv4 } from 'uuid'

export default function RosClient () {
  const { t } = useI18n()
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
      Notify.create({ type: 'positive', message: t('notify_ros_connect') })
    }

    ws.onmessage = (e) => {
      heartCheck.reset()
      const resData = JSON.parse(e.data)
      switch (resData.op.valueOf()) {
        case 'publish':
          processTopic(resData)
          break
        case 'service_response':
          serviceRsMap.set(resData.id, resData)
          break
      }
    }
  }

  function processTopic (rosObject) {
    switch (rosObject.topic) {
      case '/robot_pose':rosClient.robotPose.value = rosObject.msg; break
      case '/map_metadata': rosClient.loadMapData.value(rosObject.msg); break
      case '/map': rosClient.loadMapRaw.value(rosObject.msg); break
      case '/map_state': mapState.value = rosObject.msg.data; break
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

  const serviceRsMap = new Map()
  rosClient.call = async (service, args) => {
    const id = uuidv4()
    const rosObj = {
      op: 'call_service',
      id,
      service,
      args
    }
    wsSend(rosObj)

    while (!serviceRsMap.has(id)) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const result = serviceRsMap.get(id)
    serviceRsMap.delete(id)
    return result
  }

  rosClient.close = () => {
    Notify.create({ type: 'info', message: t('notify_ros_release') })
    alive = false
    connected.value = false
    ws.close()
  }
  rosClient.init = createWs

  const mapState = ref('idle')
  provide('mapState', mapState)
  provide('robotPose', rosClient.robotPose)
  provide('loadMapData', rosClient.loadMapData)
  provide('loadMapRaw', rosClient.loadMapRaw)
  provide('subscribe', rosClient.subscribe)
  provide('unsubscribe', rosClient.unsubscribe)
  provide('publish', rosClient.publish)
  provide('connected', connected)

  return rosClient
}
