// 1. 登陆时，客户端发送用户名密码
// 2. 服务端验证用户名密码是否正确，校验通过就会生成一个有时效的token串，发送给客户端
// 3. 客户端储存token,一般都会存储在localStorage或者cookie里面
// 4. 客户端每次请求时都带有token，可以将其放在请求头里，每次请求都携带token
// 5. 服务端验证token，所有需要校验身份的接口都会被校验token，若token解析后的数据包含用户身份信息，则身份验证通过，返回数据

// 引入模块依赖
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
// 字符串
let cert = `test`;
// 创建 token 类
class Jwt {
    constructor(data, minute) {
        this.data = data;
        this.minute = minute || 1200 // 表示2小时 得重新登录  
    }
    //生成token
    generateToken() {
        let data = this.data;
        return jwt.sign(
            {
                // token数据
                data
            },
            cert, // 密钥
            {
                //参数 options
                algorithm: "HS256", // 加密算法   对称加密算法
                issuer: "one", // 签发人
                expiresIn: this.minute * 60, // 过期时间   单位：s
            }
        );
    }
    // 校验token
    verifyToken() {
        let token = this.data
        try {
            let arr = jwt.verify(token, cert, {
              issuer: "one",
              algorithms: ["HS256"],
            });
            return arr;
          } catch (error) {
            return  "err"
          }
    }
}
module.exports = Jwt;