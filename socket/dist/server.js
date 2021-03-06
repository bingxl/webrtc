"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const port = 8888;
const wss = new ws_1.Server({ port });
let cnn; //
let users = {}; // store login user
let data;
let doaction = {
    login() {
        console.log("user login as " + data.name);
        if (users[data.name]) {
            sendTo({
                type: "login",
                success: false,
            });
        }
        else {
            cnn.name = data.name;
            users[data.name] = cnn;
            sendTo({
                type: "login",
                success: true,
            });
        }
    },
    close() {
        console.log("close connection: ", data.name);
        if (users[data.name]) {
            delete users[data.name];
        }
        if (cnn.otherName) {
            let otherCnn = users[cnn.otherName];
            // otherCnn.otherName ? (otherCnn.otherName = null) : '';
            sendTo({ type: "leave" }, otherCnn);
        }
    },
    offer() {
        console.log("sending offer to", data.name);
        let tmpConn = users[data.name];
        if (tmpConn != null) {
            cnn.otherName = data.name;
            users[data.name].otherName = cnn.name;
            sendTo({ type: "offer", offer: data.offer, name: cnn.name }, tmpConn);
        }
    },
    answer() {
        console.log("sending answer to: ", data.name);
        let tmpConn = users[data.name];
        if (tmpConn != null) {
            cnn.otherName = data.name;
            sendTo({
                type: "answer",
                answer: data.answer,
            }, tmpConn);
        }
    },
    candidate() {
        console.log("Sending candidateto", data.name);
        let tmpConn = users[data.name];
        if (tmpConn != null) {
            sendTo({ type: "candidate", candidate: data.candidate }, tmpConn);
        }
    },
    leave() {
        console.log("Disconnection user from ", data.name);
        let tmpConn = users[data.name];
        if (tmpConn.otherName)
            tmpConn.otherName = null;
        if (tmpConn != null) {
            sendTo({ type: "leave" }, tmpConn);
        }
    },
    ok() {
        sendTo({ type: "ok" }, users[data.name]);
    },
};
// 开始监听
wss.on("connection", (connection, request) => {
    console.log("user connected");
    console.log(request);
    cnn = connection;
    connection.onmessage = receive;
    connection.onclose = doaction.close;
});
wss.on("listening", () => {
    console.log("Server started in: localhost:8888");
});
function receive(message) {
    try {
        data = JSON.parse(message);
    }
    catch (e) {
        console.log("error parsing JSOON");
        data = {};
    }
    if (data.type in doaction) {
        doaction[data.type](); // 执行相关函数
    }
    else {
        sendTo({ type: "error", message: "unrecognized command " + data.type });
    }
}
function sendTo(message, conn = cnn) {
    conn.send(JSON.stringify(message));
}
// {"type": "login", "name": "bingxl1"}
// {"type": "login", "name": "bingxl2"}
// {"type": "offer", "name": "bingxl1", "offer": "hello"}
// {"type": "answer", "name": "bingxl2", "answer": "answer"}
