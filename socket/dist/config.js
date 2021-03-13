"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = exports.tokenField = exports.userNameField = exports.maxConnections = exports.port = void 0;
// socket 监听端口
exports.port = 8080;
// 最大连接数
exports.maxConnections = 12;
// 连接授权字段名
exports.userNameField = "userName";
exports.tokenField = "token";
// socket连接验证
function authentication(userName, token) {
    // @EXAMPLE 授权部分内容可以再自动扩展.
    const authors = {
        bingxl: "bingxl.cn",
        bingxl1: "bingxl.cn",
        bingxl2: "bingxl.cn",
    };
    // @ts-ignore
    return Object.keys(authors).includes(userName) && authors[userName] === token;
}
exports.authentication = authentication;
