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
