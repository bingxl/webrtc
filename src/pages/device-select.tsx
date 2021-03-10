import React, { useEffect, useRef, useState } from "react";

import "./device-select.css";

export type CurrentMediaType = {
  videoinput: MediaDeviceInfo;
  audioinput: MediaDeviceInfo;
  audiooutput: MediaDeviceInfo;
};

export default function DeviceList({
  onChangeDevice,
}: {
  onChangeDevice: (currentDevics: CurrentMediaType) => void;
}) {
  const [videoinput, setVideoinput] = useState<MediaDeviceInfo[]>([]);
  const [audioinput, setAudioinput] = useState<MediaDeviceInfo[]>([]);
  const [audiooutput, setAudiooutput] = useState<MediaDeviceInfo[]>([]);
  const videoinputRef = useRef<HTMLSelectElement>(null);
  const audioinputRef = useRef<HTMLSelectElement>(null);
  const audiooutputRef = useRef<HTMLSelectElement>(null);
  // 枚举设备
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          switch (device.kind) {
            case "videoinput": {
              setVideoinput((v) => [...v, device]);
              break;
            }
            case "audioinput": {
              setAudioinput((v) => [...v, device]);
              break;
            }
            case "audiooutput": {
              setAudiooutput((v) => [...v, device]);
              break;
            }
            default:
              console.log(`unknow device: ${device.kind}`);
          }
        });
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }, []);
  const getSelectedDevices = (): CurrentMediaType => {
    return {
      videoinput: videoinput[videoinputRef.current?.selectedIndex ?? 0],
      audioinput: audioinput[audioinputRef.current?.selectedIndex ?? 0],
      audiooutput: audiooutput[audiooutputRef.current?.selectedIndex ?? 0],
    };
  };
  const changeDevice = () => {
    const devices = getSelectedDevices();
    onChangeDevice(devices);
  };
  return (
    <div>
      {[
        { title: "摄像头", devices: videoinput, ref: videoinputRef },
        { title: "麦克风", devices: audioinput, ref: audioinputRef },
        // { title: "喇叭", devices: audiooutput, ref: audiooutputRef },
      ].map(({ title, devices, ref }) => {
        return (
          <label key={title}>
            {title}:
            <select onChange={changeDevice} ref={ref}>
              {devices.map((device) => {
                return (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                );
              })}
            </select>
          </label>
        );
      })}
    </div>
  );
}
