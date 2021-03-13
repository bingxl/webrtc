"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring_1 = __importDefault(require("querystring"));
const ws_1 = require("ws");
const config_1 = require("./config");
const ws = new ws_1.Server({ clientTracking: true, port: config_1.port });
ws.on("connection", connection);
// 存储已连接的用户socket
const users = {};
// 接收到socket消息时处理
const operation = {
    //  源用户发送offer给目标用户
    offer(socket, data) {
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
    answer(socket, data) {
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
    candidate(socket, data) {
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
    leave(socket, data) {
        //   关闭连接
        // users 中的数据 在 socket 的 onClose事件中删除
        socket.close();
    },
    //   获取连接的用户名
    getUsers(socket, data) {
        send(socket, {
            type: "getUsers",
            users: Object.keys(users),
        });
    },
};
// 有新连接时的处理
function connection(socket, request) {
    var _a, _b, _c, _d, _e;
    if (Object.keys(users).length >= config_1.maxConnections) {
        socket.close(1000, "连接池已满");
        return;
    }
    //  解析请求参数
    const qs = querystring_1.default.parse(((_a = request.url) !== null && _a !== void 0 ? _a : "?").split("?")[1] || "");
    const userName = (_c = (_b = qs[config_1.userNameField]) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : "";
    const token = (_e = (_d = qs[config_1.tokenField]) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : "";
    if (!userName) {
        socket.close(1000, "参数不全, 请添加 ?userName参数");
        return;
    }
    if (!config_1.authentication(userName, token)) {
        socket.close(1000, "授权未通过");
        return;
    }
    console.log(`用户${userName} 已连接`);
    users[userName] = socket;
    socket.onmessage = (message) => {
        let data;
        try {
            data = JSON.parse(message.data);
        }
        catch (e) {
            console.error(e);
            send(socket, { error: "接收到的数据不能使用JSON 解析" });
            return;
        }
        if (Object.keys(operation).includes(data.type)) {
            operation[data.type](socket, data);
        }
        else {
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
function send(socket, message) {
    if (socket) {
        socket.send(JSON.stringify(message));
    }
}
