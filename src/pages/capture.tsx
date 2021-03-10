import React, { useRef } from "react";

import DeviceSelect, { CurrentMediaType } from "./device-select";

import "./capture.css";

class CaptureMedia {
  // 存放媒体约束条件
  private constraints: MediaStreamConstraints = {
    audio: true,
    video: true,
  };
  // 存放媒体流
  private stream: MediaStream | null;

  // 视频元素,
  private videoRef: React.RefObject<HTMLVideoElement> | undefined;

  constructor(
    constraints?: MediaStreamConstraints,
    videoRef?: React.RefObject<HTMLVideoElement>
  ) {
    this.constraints = constraints ?? this.constraints;
    this.stream = null;
    this.videoRef = videoRef;
  }

  setVideoRef(videoRef?: React.RefObject<HTMLVideoElement>) {
    this.videoRef = videoRef;
  }

  // 获取媒体流,并在videoRef引用元素上播放
  async getMedia() {
    this.stream = await navigator.mediaDevices
      .getUserMedia(this.constraints)
      .catch((err) => {
        console.error(err);
        // 将异常继续抛出
        throw err;
      });
    this.displayInHtml();
  }
  // 调用摄像头
  async startCamera() {
    //  当出现错误时 this.stream 的值是 catch 中返回的,没有显示返回则是 void
    await this.getMedia();
  }

  // 分享屏幕
  async startScreen() {
    //  当出现错误时 this.stream 的值是 catch 中返回的,没有显示返回则是 void
    this.stream = await navigator.mediaDevices
      // @ts-ignore
      .getDisplayMedia(this.constraints)
      .catch((err: Error) => {
        console.error(err);
        // 将异常继续抛出
        throw err;
      });

    this.displayInHtml();
  }

  // 播放媒体流
  displayInHtml() {
    if (this.videoRef?.current) {
      this.videoRef.current.srcObject = this.stream;
    }
  }

  // 截图, 将视频流的当前帧显示到canvas中
  takeSnap(canvasRef: React.RefObject<HTMLCanvasElement>) {
    if (!this.stream) {
      return;
    }
    const imageCapture = new ImageCapture(this.stream.getVideoTracks()[0]);
    imageCapture.grabFrame().then((img: ImageBitmap) => {
      const canvas = canvasRef.current;
      if (canvas !== null) {
        const ctx = canvas.getContext("2d");
        let width;
        let height;
        {
          const { width: widthStr, height: heightStr } = getComputedStyle(
            canvas
          );
          width = Number(widthStr.split("px")[0]);
          height = Number(heightStr.split("px")[0]);
        }

        ctx && ctx.clearRect(0, 0, width, height);
        ctx && ctx.drawImage(img, 0, 0, width, height);
      }
    });
  }

  // 更改设备
  changeDevices(constraints: MediaStreamConstraints) {
    this.constraints = constraints;
    this.stream?.getTracks().forEach((track) => {
      this.stream?.removeTrack(track);
    });

    this.getMedia();
  }
}

export default function Capture() {
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capture = new CaptureMedia({ audio: false, video: true }, myVideoRef);

  const changeDevice = ({ videoinput, audioinput }: CurrentMediaType) => {
    // @TODO 构造 TrackConstraints 传入capture.applyConstraints
    console.log(videoinput);
    capture.changeDevices({
      video: { deviceId: videoinput.deviceId },
      audio: { deviceId: audioinput.deviceId },
    });
  };

  return (
    <div>
      <DeviceSelect onChangeDevice={changeDevice} />
      <section>
        <section>
          <div>我的视频</div>
          <video className="myvideo" src="#" autoPlay ref={myVideoRef}></video>
        </section>
        <section>
          <div>对方视频</div>
          <video className="othervideo" src="#" autoPlay></video>
        </section>
        <section>
          <div>画布</div>
          <canvas className="canvas" ref={canvasRef}></canvas>
        </section>
      </section>
      <section>
        <button onClick={() => capture.startCamera()}>捕捉媒体</button>
        <button onClick={() => capture.takeSnap(canvasRef)}>拍照</button>
        <button onClick={() => capture.startScreen()}>分享屏幕</button>
      </section>
    </div>
  );
}
