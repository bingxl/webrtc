import WebSocket = require("ws");

interface IMessage {
  type: "offer" | "answer" | "candidate" | "leave" | "getUsers" | "error";
  sName?: string;
  dName?: string;
  offer?: string;
  answer?: string;
  candidate?: string;
  from?: string;
  to?: string;
  message?: string;
}

class Client {
  wsUrl: string = "ws://localhost:8080?userName=";
  userName: string;
  ws: WebSocket;
  constructor(name: string, token: string = "bingxl.cn") {
    this.userName = name;
    // 通过将userName和token添加到websocket地址中实现验证
    this.ws = new WebSocket(`${this.wsUrl}${this.userName}&token=${token}`);
    this.ws.onmessage = this.onmessage;
    this.ws.onclose = this.onclose;
    this.ws.onopen = this.onopen;
  }
  onmessage = (e: WebSocket.MessageEvent) => {
    console.log(`${this.userName} 收到消息 ${e.data}`);
    const result: IMessage = JSON.parse(e.data.toString());
    switch (result.type) {
      case "offer": {
        this.send({
          type: "answer",
          sName: this.userName,
          dName: result.from,
          answer: "this is an answer example",
        });
        break;
      }
      case "answer": {
        this.send({
          type: "candidate",
          sName: this.userName,
          dName: result.from,
          candidate: "this is a candidate example",
        });
        break;
      }
    }
  };

  onopen = () => {
    console.log(`${this.userName} 的socket 已连接`);
  };
  onclose = (e: WebSocket.CloseEvent) => {
    console.log(
      `${this.userName} 的连接已关闭, code: ${e.code}, reason: ${e.reason}`
    );
  };
  send = (message: IMessage) => {
    if (this.ws.readyState !== 1) {
      // WebSocket 暂时不能用
      console.log("websocket 不是处于打开模式");
      return false;
    }
    let data = {};
    try {
      data = JSON.stringify(message);
    } catch (e) {
      console.error(e);
      return false;
    }
    this.ws.send(data);
  };
  waitOpen = async () => {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === 1) {
        return resolve(true);
      }
      let times = 0;
      const handle = setInterval(() => {
        if (this.ws.readyState === 1) {
          clearInterval(handle);
          return resolve(true);
        } else if (times >= 20) {
          clearInterval(handle);
          return reject("超时");
        }
        times++;
      }, 100);
    });
  };
  getUsers = () => {
    this.send({ type: "getUsers" });
  };
}

(async () => {
  const ws1Name = "bingxl1";
  const ws2Name = "bingxl2";
  const ws1 = new Client(ws1Name);
  const ws2 = new Client(ws2Name);
  //   等待都连接上后在操作
  await ws1.waitOpen();
  await ws2.waitOpen();

  ws2.getUsers();

  ws1.send({
    type: "offer",
    dName: ws2Name,
    sName: ws1Name,
    offer: "this is a offer example",
  });
  new Client("bingxl3", "123");
})();
