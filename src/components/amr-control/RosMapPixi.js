import * as PIXI from 'pixi.js'
import { getCssVar } from 'quasar'
import { useControlParams } from 'stores/control-params'

const controlParam = useControlParams()

export default function () {
  const mapRender = {
    dragging: false,
    focusing: false,
    poseColor: '0xFF6666',
    lastPosition: { x: 0, y: 0 },
    poseContainer: new PIXI.Container()
  }

  /**
   * 在Canvas中渲染机器人的图标
   */
  mapRender.createRobot = () => {
    const robotImg = new Image()
    robotImg.src = 'arrow.png'
    robotImg.onload = function () {
      const robot = PIXI.Sprite.from(robotImg)
      robot.alpha = 1
      robot.scale.set(controlParam.arrowScale / robotImg.width)
      robot.anchor.set(0.5)
      robot.tint = getCssVar('primary')
      mapRender.robot = robot
      mapRender.updateStage()
    }
  }

  /**
   * 更新机器人的位置和角度
   * @param pose 机器人的Pose
   */
  mapRender.updateRobotPose = (pose) => {
    if (mapRender.robot) {
      mapRender.robot.x = pose.position.x
      mapRender.robot.y = -pose.position.y
      mapRender.robot.rotation = (90 + mapRender.quaternionToTheta(pose.orientation)) * Math.PI / 180
      if (!mapRender.pose) {
        mapRender.pose = pose
        mapRender.focus()
      } else {
        mapRender.pose = pose
        if (mapRender.focusing) {
          mapRender.focus()
        }
      }
    }
  }

  mapRender.loadPoseList = function (poseList) {
    mapRender.poseContainer.removeChildren()
    const poseImg = new Image()
    poseImg.src = 'pose.png'
    poseImg.onload = function () {
      poseList.forEach(p => {
        const pos = p.pose || p
        const point = PIXI.Sprite.from(poseImg)
        point.anchor.set(0.5)
        point.alpha = 0.66
        const scale = controlParam.arrowScale / poseImg.width
        point.scale.set(scale)
        point.tint = getCssVar('info')

        point.x = pos.position.x
        point.y = -pos.position.y
        point.rotation = (90 + mapRender.quaternionToTheta(pos.orientation)) * Math.PI / 180
        point.name = p.header.seq

        mapRender.poseContainer.addChild(point)
      })
    }
  }

  mapRender.changePoseColor = (seq) => {
    mapRender.poseContainer.children.forEach(point => {
      if (point.name === seq) {
        point.tint = getCssVar('positive')
      } else {
        point.tint = getCssVar('info')
      }
    })
  }

  mapRender.quaternionToTheta = (quaternion) => {
    const q0 = quaternion.w
    const q1 = quaternion.x
    const q2 = quaternion.y
    const q3 = quaternion.z
    // Canvas rotation is clock wise and in degrees
    return (-Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3)) * 180.0 / Math.PI)
  }

  /**
   * 初始化地图
   * @param option 传入参数，需包含需要渲染的canvas
   */
  mapRender.init = (option) => {
    mapRender.canvas = option.canvas

    const app = new PIXI.Application({
      resizeTo: option.canvas,
      backgroundColor: getCssVar('info'),
      view: option.canvas
    })

    /*
    鼠标滚轮缩放
     */
    app.view.addEventListener('wheel', (event) => {
      const delta = event.deltaY > 0 ? 0.9 : 1.1
      const originScale = mapRender.app.stage.scale
      mapRender.app.stage.scale.set(originScale.x * delta, originScale.y * delta)
    })

    // 当鼠标按下时开始拖动
    app.view.addEventListener('pointerdown', (event) => {
      if (mapRender.changeLocation) {
        const timeInterval = new Date().getTime()
        if (mapRender.lastClick && timeInterval - mapRender.lastClick < 500) {
          mapRender.changePose(mapRender.globalToRos(event.x, event.y))
        }
        mapRender.lastClick = timeInterval
      } else if (mapRender.changeDirection) {
        mapRender.changeTheta(mapRender.globalToRos(event.x, event.y))
      } else {
        mapRender.dragging = true
        mapRender.lastPosition = {
          x: event.x,
          y: event.y
        }
      }
    })

    // 当鼠标移动时，如果处于拖动状态，则移动画布
    app.view.addEventListener('pointermove', function (event) {
      if (mapRender.dragging) {
        app.stage.x += event.x - mapRender.lastPosition.x
        app.stage.y += event.y - mapRender.lastPosition.y
        mapRender.lastPosition = {
          x: event.x,
          y: event.y
        }
      }
    })

    app.view.addEventListener('pointerup', function () {
      mapRender.dragging = false
    })

    mapRender.app = app
  }

  /**
   * 将地图切换到机器人当前的位置
   */
  mapRender.focus = () => {
    mapRender.app.stage.x = mapRender.canvas.offsetWidth / 2 - (mapRender.pose.position.x * mapRender.app.stage.scale.x)
    mapRender.app.stage.y = mapRender.canvas.offsetHeight / 2 + (mapRender.pose.position.y * mapRender.app.stage.scale.y)
  }

  /**
   * 使用ros上报的原始地图数据进行渲染
   * @param data OccupancyGrid格式的地图
   */
  mapRender.processMapRaw = (data) => {
    const texture = PIXI.Texture.fromBuffer(
      new Uint8Array(data.data.map(x => {
        switch (x) {
          case -1: return [0, 0, 0, 10]
          default: {
            const grayScale = (100 - x) / 100 * 255
            return [grayScale, grayScale, grayScale, 255]
          }
        }
      }).flat()),
      data.info.width,
      data.info.height
    )

    const map = new PIXI.Sprite(texture)

    map.scale.set(data.info.resolution)
    map.anchor.y = 1
    map.scale.set(map.scale.x, -map.scale.y)

    map.y = map.height * data.info.resolution
    map.x += data.info.origin.position.x
    map.y += data.info.origin.position.y

    if (mapRender.map) {
      mapRender.map = map
      mapRender.app.stage.removeChildAt(0)
      mapRender.app.stage.addChildAt(mapRender.map, 0)
    } else {
      mapRender.map = map
      mapRender.createRobot()
    }

    PIXI.utils.clearTextureCache()
  }

  /**
   * 渲染Canvas中需要渲染的元素
   */
  mapRender.updateStage = () => {
    let W = 10
    let H = 10
    if (mapRender.canvas.height > mapRender.canvas.width) {
      H = W * mapRender.canvas.offsetHeight / mapRender.canvas.offsetWidth
    } else {
      W = H * mapRender.canvas.offsetWidth / mapRender.canvas.offsetHeight
    }
    mapRender.app.stage.scale.set(mapRender.canvas.offsetWidth / W, mapRender.canvas.offsetHeight / H)

    mapRender.app.stage.removeChildren()
    mapRender.app.stage.addChild(mapRender.map)
    mapRender.app.stage.addChild(mapRender.poseContainer || new PIXI.Container())
    mapRender.app.stage.addChild(mapRender.robot || new PIXI.Sprite())
  }

  /**
   * 全局坐标转ros坐标
   * @param x 全局水平坐标
   * @param y 全局垂直坐标
   */
  mapRender.globalToRos = (x, y) => {
    const rosX = (x - mapRender.app.stage.x) / mapRender.app.stage.scale.x
    const rosY = (mapRender.app.stage.y - y + 50) / mapRender.app.stage.scale.y
    return { x: rosX, y: rosY }
  }

  return mapRender
}
