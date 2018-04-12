let WebSocketServer = require('ws').Server;
let fs = require("fs");
let https = require('https');

let keypath = __dirname + '/server.key';
let certpath = __dirname + '/server.crt';
let options = {
    hostname: 'cloud.bingxl.cn',
    key: fs.readFileSync(keypath),
    cert: fs.readFileSync(certpath),
    rejectUnauthorized: false
};
let server = https.createServer(options,(req, res) => {
    res.writeHead(200);
    res.end("this is a websocket server \n");
}).listen(8888);
