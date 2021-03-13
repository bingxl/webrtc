"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
class Client {
    constructor(name, token = "bingxl.cn") {
        this.wsUrl = "ws://localhost:8080?userName=";
        this.onmessage = (e) => {
            console.log(`${this.userName} 收到消息 ${e.data}`);
            const result = JSON.parse(e.data.toString());
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
        this.onopen = () => {
            console.log(`${this.userName} 的socket 已连接`);
        };
        this.onclose = (e) => {
            console.log(`${this.userName} 的连接已关闭, code: ${e.code}, reason: ${e.reason}`);
        };
        this.send = (message) => {
            if (this.ws.readyState !== 1) {
                // WebSocket 暂时不能用
                console.log("websocket 不是处于打开模式");
                return false;
            }
            let data = {};
            try {
                data = JSON.stringify(message);
            }
            catch (e) {
                console.error(e);
                return false;
            }
            this.ws.send(data);
        };
        this.waitOpen = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.ws.readyState === 1) {
                    return resolve(true);
                }
                let times = 0;
                const handle = setInterval(() => {
                    if (this.ws.readyState === 1) {
                        clearInterval(handle);
                        return resolve(true);
                    }
                    else if (times >= 20) {
                        clearInterval(handle);
                        return reject("超时");
                    }
                    times++;
                }, 100);
            });
        });
        this.getUsers = () => {
            this.send({ type: "getUsers" });
        };
        this.userName = name;
        // 通过将userName和token添加到websocket地址中实现验证
        this.ws = new WebSocket(`${this.wsUrl}${this.userName}&token=${token}`);
        this.ws.onmessage = this.onmessage;
        this.ws.onclose = this.onclose;
        this.ws.onopen = this.onopen;
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const ws1Name = "bingxl1";
    const ws2Name = "bingxl2";
    const ws1 = new Client(ws1Name);
    const ws2 = new Client(ws2Name);
    //   等待都连接上后在操作
    yield ws1.waitOpen();
    yield ws2.waitOpen();
    ws2.getUsers();
    ws1.send({
        type: "offer",
        dName: ws2Name,
        sName: ws1Name,
        offer: "this is a offer example",
    });
    new Client("bingxl3", "123");
}))();
