# webRTC

## 浏览器获取媒体流

`async navigator.mediaDevices.getUserMedia(constraints)`

```typescript

const constraints: MediaStreamConstaints = {
    video: true,
    audio: true,
}
navigator.mediaDevices.getUserMedia(constraints)
    .then(stream: MediaStream => {
        // 获取到媒体流
    })
    .catch(err => {
        // 捕获媒体设备出错处理
    })

```

## TURN 服务器搭建

[参考](https://webrtc.org.cn/webrtc-tutorial-2-signaling-stun-turn/), 其中在 ubuntu 中安装 coturn 服务器时可以使用 `apt install coturn` 安装, 启动命令为`turnserver`

## 启动信令服务器

在 /socket 下提供了简单的 WebSocket 服务器 运行方式参考 [README.md](./socket/README.md)
