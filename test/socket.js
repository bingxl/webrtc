let WebSocketServer = require('ws').Server;
let fs = require("fs");
let https = require('https');

let pfxpath = __dirname + '/cloud.bingxl.cn.pfx';
let passpath = __dirname + '/keystorePass.txt';
let options = {
    pfx: fs.readFileSync(pfxpath),
    passphrase: fs.readFileSync(passpath),
};
let server = https.createServer(options,(req,res) => {
    res.writeHead(200);
    res.write("hello SSL in node");
    res.end();
}).listen(8888);
