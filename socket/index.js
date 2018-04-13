let env = "dev"; // dev or pro
let WebSocketServer = require('ws').Server;

let init = {
    dev(){
        wss = new WebSocketServer({port:8888});
    },
    pro() {
        let https = require("https");
        let fs = require("fs");
        let pfxpath = __dirname + '/cloud.bingxl.cn.pfx';
        let passpath = __dirname + '/keystorePass.txt';
        let options = {
            pfx: fs.readFileSync(pfxpath),
            passphrase: fs.readFileSync(passpath),
        };
        let server = https.createServer(options, (req, res) => {
            res.writeHead(200);
            res.end("this is a websocket server \n");
        }).listen(8888);

        let wss = new WebSocketServer({ server: server });
    }
};

init[env]();

let cnn; // 
let users = {}; // store login user
let data;
let doaction = {
    login() {
        console.log("user login as " + data.name);

        if (users[data.name]) {
            sendTo({
                type: 'login',
                success: false
            });
        } else {

            cnn.name = data.name;
            users[data.name] = cnn;
            sendTo({
                type: 'login',
                success: true
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
            sendTo({ type: 'leave' }, otherCnn);
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
                answer: data.answer
            }, tmpConn);
        }
    },

    candidate() {
        console.log("Sending candidateto", data.name);
        let tmpConn = users[data.name];
        if (tmpConn != null) {
            sendTo({ type: 'candidate', candidate: data.candidate }, tmpConn);
        }
    },
    leave() {
        console.log("Disconnection user from ", data.name);
        let tmpConn = users[data.name];
        if (tmpConn.otherName) tmpConn.otherName = null;

        if (tmpConn != null) {
            sendTo({ type: 'leave' }, tmpConn);
        }
    },
    ok() {
        sendTo({type: 'ok'}, users[data.name]);
    }

}
// 开始监听
wss.on(
    "connection",
    connection => {
        console.log("user connected");
        cnn = connection;
        connection.on("message", receive);
        connection.on("close", doaction.close);
    }
)

wss.on("listening", () => {
    console.log("Server started in: localhost:8888");
})
function receive(message) {
    try {
        data = JSON.parse(message);
    } catch (e) {
        console.log("error parsing JSOON");
        data = {};
    }

    if (data.type in doaction) {
        doaction[data.type](); // 执行相关函数
    } else {
        sendTo({ type: 'error', message: 'unrecognized command ' + data.type });
    }
}

function sendTo(message, conn = cnn) {
    conn.send(JSON.stringify(message));
}


// {"type": "login", "name": "bingxl1"}
// {"type": "login", "name": "bingxl2"}
// {"type": "offer", "name": "bingxl1", "offer": "hello"}
// {"type": "answer", "name": "bingxl2", "answer": "answer"}