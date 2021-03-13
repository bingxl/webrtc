// socket 监听端口
export const port = 8080;
// 最大连接数
export const maxConnections = 12;

// 连接授权字段名
export const userNameField = "userName";
export const tokenField = "token";
// socket连接验证
export function authentication(userName: string, token: string): boolean {
  // @EXAMPLE 授权部分内容可以再自动扩展.
  const authors = {
    bingxl: "bingxl.cn",
    bingxl1: "bingxl.cn",
    bingxl2: "bingxl.cn",
  };

  // @ts-ignore
  return Object.keys(authors).includes(userName) && authors[userName] === token;
}
