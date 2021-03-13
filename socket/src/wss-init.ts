import { IncomingMessage } from "node:http";
import querystring from "querystring";
import { Server } from "ws";
import {
  port,
  maxConnections,
  userNameField,
  tokenField,
  authentication,
} from "./config";

interface IMessage {
  type: "offer" | "answer" | "candidate" | "leave" | "getUsers";
  sName?: string;
  dName?: string;
  offer?: string;
  answer?: string;
  candidate?: string;
  from?: string;
  to?: string;
}

const ws = new Server({ clientTracking: true, port });
ws.on("connection", connection);

// 存储已连接的用户socket
const users: { [index: string]: WebSocket } = {};

// 接收到socket消息时处理
const operation = {
  //  源用户发送offer给目标用户
  offer(socket: WebSocket, data: IMessage) {
    //   目标用户存在,发送offer信息给目标用户
    if (data.dName && users[data.dName]) {
      send(users[data.dName], {
        type: "offer",
        from: data.sName,
        to: data.dName,
        offer: data.offer,
      });
      return;
    }
    //   目标用户不存在,发送消息给源用户
    send(socket, { error: "目标用户未连接" });
  },
  //   answer
  answer(socket: WebSocket, data: IMessage) {
    //   目标用户存在,发送answer信息给目标用户
    if (data.dName && users[data.dName]) {
      send(users[data.dName], {
        type: "answer",
        from: data.sName,
        to: data.dName,
        answer: data.answer,
      });
      return;
    }
    //   目标用户不存在,发送消息给源用户
    send(socket, { error: "目标用户未连接" });
  },
  candidate(socket: WebSocket, data: IMessage) {
    //   目标用户存在,发送candidate信息给目标用户
    if (data.dName && users[data.dName]) {
      send(users[data.dName], {
        type: "candidate",
        from: data.sName,
        to: data.dName,
        candidate: data.candidate,
      });
      return;
    }
    //   目标用户不存在,发送消息给源用户
    send(socket, { error: "目标用户未连接" });
  },
  leave(socket: WebSocket, data: IMessage) {
    //   关闭连接
    // users 中的数据 在 socket 的 onClose事件中删除
    socket.close();
  },
  //   获取连接的用户名
  getUsers(socket: WebSocket, data: IMessage) {
    send(socket, {
      type: "getUsers",
      users: Object.keys(users),
    });
  },
};

// 有新连接时的处理
function connection(socket: WebSocket, request: IncomingMessage): void {
  if (Object.keys(users).length >= maxConnections) {
    socket.close(1000, "连接池已满");
    return;
  }
  //  解析请求参数

  const qs = querystring.parse((request.url ?? "?").split("?")[1] || "");
  const userName: string = qs[userNameField]?.toString() ?? "";
  const token: string = qs[tokenField]?.toString() ?? "";

  if (!userName) {
    socket.close(1000, "参数不全, 请添加 ?userName参数");
    return;
  }
  if (!authentication(userName, token)) {
    socket.close(1000, "授权未通过");
    return;
  }
  console.log(`用户${userName} 已连接`);

  users[userName] = socket;
  socket.onmessage = (message) => {
    let data: IMessage;
    try {
      data = JSON.parse(message.data);
    } catch (e) {
      console.error(e);
      send(socket, { error: "接收到的数据不能使用JSON 解析" });
      return;
    }
    if (Object.keys(operation).includes(data.type)) {
      operation[data.type](socket, data);
    } else {
      send(socket, { error: "未能识别的type" });
    }
  };

  socket.onclose = (e) => {
    if (users[userName]) {
      // 从 Users 中删除 socket 连接
      delete users[userName];
    }
    console.log(`用户${userName} 已关闭连接`);
  };
}

// 发送socket消息
function send(socket: WebSocket, message: Object) {
  if (socket) {
    socket.send(JSON.stringify(message));
  }
}
