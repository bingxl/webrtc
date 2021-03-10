import React, { useRef } from "react";

import "./recorder.css";

export default function Recorder({ stream }: { stream: MediaStream }) {
  let recorder: MediaRecorder;
  let chunks: Blob[] = [];
  const videoRef = useRef<HTMLVideoElement>(null);

  const handle = {
    start() {
      recorder = new MediaRecorder(stream);
      recorder.start();
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = (e) => {
        const blobs = new Blob(chunks);
        if (videoRef.current) {
          videoRef.current.src = URL.createObjectURL(blobs);
        }
      };
    },
    stop() {
      recorder.stop();
    },
    pause() {
      recorder.pause();
    },
    resume() {
      recorder.resume();
    },
    delete() {
      chunks = [];
    },
  };
  function buttonHandle(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    const { className } = e.target as HTMLElement;
    if (className in handle) {
      // @ts-ignore
      handle[className]();
    }
  }
  return (
    <section>
      <section className="operation" onClick={buttonHandle}>
        <button className="start">开始</button>
        <button className="stop">停止</button>
        <button className="pause">暂停</button>
        <button className="resume">继续</button>
        <button className="delete">删除</button>
      </section>
      <section className="playvideo">
        <video ref={videoRef} controls></video>
      </section>
    </section>
  );
}
