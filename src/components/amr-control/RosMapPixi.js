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
      mapRender.robot = new PIXI.Container()
      mapRender.robot.addChild(robot)
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
      mapRender.removeTarget()
    }
  }

  mapRender.updateTargetPose = (pose) => {
    if (mapRender.target) {
      mapRender.target.x = pose.position.x
      mapRender.target.y = -pose.position.y
      mapRender.target.rotation = (90 + mapRender.quaternionToTheta(pose.orientation)) * Math.PI / 180
    } else {
      const targetImg = new Image()
      targetImg.src = 'arrow.png'
      targetImg.onload = function () {
        const target = PIXI.Sprite.from(targetImg)
        target.anchor.set(0.5)
        target.alpha = 0.66
        target.scale.set(controlParam.arrowScale / targetImg.width)
        target.tint = getCssVar('positive')
        target.x = pose.position.x
        target.y = -pose.position.y
        target.rotation = (90 + mapRender.quaternionToTheta(pose.orientation)) * Math.PI / 180
        mapRender.target = target
        mapRender.app.stage.addChild(mapRender.target)
      }
    }
  }

  mapRender.removeTarget = () => {
    mapRender.app.stage.removeChild(mapRender.target)
    mapRender.target = null
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
    app.view.addEventListener('wheel', event => {
      const scale = mapRender.app.stage.scale
      const delta = event.deltaY > 0 ? 0.9 : 1.1
      scale.set(scale.x * delta, scale.y * delta)
    })

    // 当鼠标按下时开始拖动
    app.view.addEventListener('pointerdown', event => {
      if (mapRender.changeLocation) {
        mapRender.changePose(mapRender.globalToRos(event.x, event.y))
      } else if (mapRender.changeDirection) {
        mapRender.changeTheta(mapRender.globalToRos(event.x, event.y))
      } else if (mapRender.drawPath) {
        mapRender.drawPathInit()
      } else {
        mapRender.dragging = true
        mapRender.lastPosition = {
          x: event.x,
          y: event.y
        }
      }
    })

    // 当鼠标移动时，如果处于拖动状态，则移动画布
    app.view.addEventListener('pointermove', event => {
      if (mapRender.drawing) {
        mapRender.drawPathUpdate(mapRender.globalToRos(event.x, event.y))
        return
      }
      if (!mapRender.dragging || mapRender.focusing) return
      const { x, y } = event
      app.stage.x += x - mapRender.lastPosition.x
      app.stage.y += y - mapRender.lastPosition.y
      mapRender.lastPosition = { x, y }
    })

    app.view.addEventListener('pointerup', function () {
      mapRender.dragging = false
      mapRender.drawing = false
    })

    app.view.addEventListener('touchstart', event => {
      if (event.touches.length === 2) {
        mapRender.dragging = false
        mapRender.initialDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        )
        mapRender.initialScale = mapRender.app.stage.scale.x
      }
    })

    app.view.addEventListener('touchmove', event => {
      if (event.touches.length === 2 && mapRender.initialDistance) {
        mapRender.dragging = false
        const currentDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        )
        const scaleRatio = currentDistance / mapRender.initialDistance
        mapRender.app.stage.scale.set(scaleRatio * mapRender.initialScale, scaleRatio * mapRender.initialScale)
      }
    })

    app.view.addEventListener('touchend', () => {
      mapRender.initialDistance = null
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

    map.y = -map.height

    map.x += data.info.origin.position.x
    map.y -= data.info.origin.position.y

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

  mapRender.processLaserScan = (data) => {
    // if (mapRender.lastLaserScan && (mapRender.lastLaserScan.header.stamp.secs === data.header.stamp.secs)) return
    // mapRender.lastLaserScan = data
    const laserScan = new PIXI.Container()
    data.ranges.forEach((range, i) => {
      const angle = data.angle_min + i * data.angle_increment
      const x = range * Math.cos(angle)
      const y = -range * Math.sin(angle)

      // 创建一个新的Graphics对象，用于绘制单个激光点
      const point = new PIXI.Graphics()
      point.beginFill(getCssVar('negative'))
      point.drawCircle(x, y, 0.05) // 0.05是圆点的半径，你可以根据需要调整
      point.endFill()

      // 将激光点添加到laserScan中
      laserScan.addChild(point)
    })

    laserScan.position.x = mapRender.robot.x
    laserScan.position.y = mapRender.robot.y
    laserScan.rotation = mapRender.robot.rotation - Math.PI / 2

    if (mapRender.laserScan) {
      mapRender.app.stage.removeChild(mapRender.laserScan)
    }
    mapRender.app.stage.addChild(laserScan)
    mapRender.laserScan = laserScan
  }

  mapRender.processPath = (data) => {
    if (data.poses.length < 2) {
      mapRender.clearPath()
      return
    }
    const path = new PIXI.Graphics()
    path.lineStyle(0.05, getCssVar('positive'))
    path.moveTo(data.poses[0].pose.position.x, -data.poses[0].pose.position.y)
    data.poses.forEach(p => {
      path.lineTo(p.pose.position.x, -p.pose.position.y)
    })
    if (mapRender.path) {
      mapRender.app.stage.removeChild(mapRender.path)
    }
    mapRender.app.stage.addChild(path)
    mapRender.path = path
  }

  mapRender.processTrajectory = (data) => {
    if (data.poses.length < 2) {
      mapRender.clearPath()
      return
    }
    const trajectory = new PIXI.Graphics()
    trajectory.lineStyle(0.05, getCssVar('info'), 0.3)
    trajectory.moveTo(data.poses[0].pose.position.x, -data.poses[0].pose.position.y)
    data.poses.forEach(p => {
      trajectory.lineTo(p.pose.position.x, -p.pose.position.y)
    })
    if (mapRender.trajectory) {
      mapRender.app.stage.removeChild(mapRender.trajectory)
    }
    mapRender.app.stage.addChild(trajectory)
    mapRender.trajectory = trajectory
  }

  mapRender.clearPath = () => {
    if (mapRender.path) {
      mapRender.app.stage.removeChild(mapRender.path)
      mapRender.path = null
    }
  }

  mapRender.clearTrajectory = () => {
    if (mapRender.trajectory) {
      mapRender.app.stage.removeChild(mapRender.trajectory)
      mapRender.trajectory = null
    }
  }

  mapRender.drawPathInit = () => {
    mapRender.drawPathEnd()
    mapRender.removeTarget()
    mapRender.drawing = true
  }

  mapRender.drawPathUpdate = (pose) => {
    if (mapRender.drawedPath) {
      const length = mapRender.drawedPathData.length
      mapRender.drawedPath.moveTo(mapRender.drawedPathData[length - 1].x, -mapRender.drawedPathData[length - 1].y)
      mapRender.drawedPath.lineTo(pose.x, -pose.y)
    } else {
      const line = new PIXI.Graphics()
      line.lineStyle(0.05, getCssVar('accent')) // 设置线的样式
      line.moveTo(pose.x, -pose.y)
      mapRender.drawedPath = line
      mapRender.app.stage.addChild(mapRender.drawedPath)
      mapRender.drawedPathData = []
    }
    mapRender.drawedPathData.push(pose)
  }

  mapRender.drawPathEnd = () => {
    mapRender.app.stage.removeChild(mapRender.drawedPath)
    mapRender.drawedPath = null
  }

  mapRender.processCostMap = (data) => {
    const texture = PIXI.Texture.fromBuffer(
      new Uint8Array(data.data.map(x => {
        switch (x) {
          case -1: return [0, 0, 0, 0]
          default: {
            const grayScale = (100 - x) / 100 * 255
            return [grayScale, grayScale, grayScale, 200]
          }
        }
      }).flat()),
      data.info.width,
      data.info.height
    )

    const costMap = new PIXI.Sprite(texture)

    costMap.scale.set(data.info.resolution)
    costMap.anchor.y = 1
    costMap.scale.set(costMap.scale.x, -costMap.scale.y)

    if (mapRender.robot) {
      costMap.x += mapRender.robot.x - costMap.width / 2
      costMap.y += mapRender.robot.y - costMap.height / 2

      if (mapRender.costMap) {
        mapRender.app.stage.removeChild(mapRender.costMap)
      }
      mapRender.app.stage.addChildAt(costMap, 1)
      mapRender.costMap = costMap

      PIXI.utils.clearTextureCache()
    }
  }

  mapRender.clearCostMap = () => {
    if (mapRender.costMap) {
      mapRender.app.stage.removeChild(mapRender.costMap)
      mapRender.costMap = null
    }
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
    mapRender.app.stage.addChild(mapRender.robot || new PIXI.Container())
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
