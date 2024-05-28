# ROS2D-Quasar

Ros2d-quasar是一个基于vue3开发的ROS前端程序，可以实现通过Web来操作移动机器人。目前，Ros2d-quasar包括的主要特性包括：

- 通过RosBridge-Websocket(ROS1-Noetic & ROS2-Humble)，和机器人建立连接
- 使用虚拟手柄遥控机器人
- 实时查看机器人当前所在的位置和地图
- 开启机器人的建图或导航程序
- 重定位机器人（类似于Rviz中的2D-Pose-Estimate）
- 下发导航目标（类似于Rviz中的2D-Nav-Goal）
- 管理和地图绑定的导航点位，令机器人移动到指定的点位



Ros2d-quasar基于[Quasar Framework](https://quasar.dev/)开发，因此可以使用Quasar本身的一些特性，例如打包成安卓应用。

渲染地图使用的引擎是[PixiJS | The HTML5 Creation Engine | PixiJS](https://pixijs.com/)

与ROS的连接使用的是原生WebSocket，没有使用[roslibjs](https://github.com/RobotWebTools/roslibjs)



## 1. 启动项目

启动项目之前，请确保已安装LTS版本（双数版本号）的[Node.js](https://nodejs.org/en)和[Yarn](https://classic.yarnpkg.com/lang/en/docs/install)。如果已经安装好了nodejs，可以通过以下的指令安装yarn

```
npm install --global yarn
```

准备好环境后，进入项目文件夹，使用以下的指令安装依赖

```bash
yarn
```

依赖完成后，通过以下的指令启动项目，程序默认会运行在9000端口上

```bash
quasar dev
```

如果需要更新项目使用的quasar框架版本，可以使用以下指令：

```bash
yarn upgrade quasar
```

如果需要启动一个ROS仿真程序来进一步体验，可以参考：[legubiao/AMR-Remote-Control-Toolkit: A rospkg enable launch mapping through topic command and provide support for quasar-ros2d (github.com)](https://github.com/legubiao/AMR-Remote-Control-Toolkit)



## 2. 编译Docker镜像

构建项目
```bash
quasar build
```

生成Docker镜像
```bash
docker build -t ros2d-quasar .
```

## 3.docker 运行

pull 镜像
```bash
docker pull legubiao/ros2d-quasar
```

运行容器
```bash
docker run -d --name=ros2d-quasar --restart=always -p 80:80 legubiao/ros2d-quasar:latest
```



已经配置Github Actions自动打包，也可以直接通过[DockerHub](https://hub.docker.com/repository/docker/legubiao/ros2d-quasar/general)下载使用镜像



