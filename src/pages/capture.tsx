import React, { useRef } from "react";

import "./capture.less";

class CaptureMedia {
  constraints: MediaStreamConstraints = {
    audio: true,
    video: true,
  };
  stream: MediaStream | null;
  constructor(constraints?: MediaStreamConstraints) {
    this.constraints = constraints ?? this.constraints;
    this.stream = null;
  }

  async start(videoRef: React.RefObject<HTMLVideoElement>) {
    //  当出现错误时 this.stream 的值是 catch 中返回的,没有显示返回则是 void
    this.stream = await navigator.mediaDevices
      .getUserMedia(this.constraints)
      .catch((err) => {
        console.error(err);
        // 将异常继续抛出
        throw new Error(err);
      });

    this.displayInHtml(videoRef);
  }

  getStream() {
    return this.stream;
  }

  displayInHtml(videoRef: React.RefObject<HTMLVideoElement>) {
    if (videoRef.current) {
      videoRef.current.srcObject = this.stream;
    }
  }
}

export default function Capture() {
  const myVideoRef = useRef<HTMLVideoElement>(null);

  const capture = new CaptureMedia();

  return (
    <div>
      <video src="#" className="myvideo" autoPlay ref={myVideoRef}></video>
      <video src="#" className="anothervideo" autoPlay></video>
      <button onClick={() => capture.start(myVideoRef)}>捕捉媒体</button>
    </div>
  );
}
