let WebSocketServer = require('ws').Server;
let fs = require("fs");
let https = require('https');
let tls = require("tls");

let keypath = __dirname + '/server.key';
let certpath = __dirname + '/server.crt';
let options = {
    hostname: 'cloud.bingxl.cn',
    key: fs.readFileSync(keypath),
    cert: fs.readFileSync(certpath),
    rejectUnauthorized: false
};
let server = tls.createServer(options,(stream) => {
    stream.write("welecome \n");
    stream.setEncoding('utf8');
    stream.pipe(stream);
}).listen(8888);
