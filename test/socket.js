let WebSocketServer = require('ws').Server;
let fs = require("fs");
let https = require('https');

let keypath = './server.key';
let certpath = './server.crt';
let options = {
    key: fs.readFileSync(keypath),
    cert: fs.readFileSync(certpath),
    rejectUnauthorized: false
};
let server = https.createServer(options,(req, res) => {
    res.writeHead(200);
    res.end("this is a websocket server \n");
}).listen(8888);
