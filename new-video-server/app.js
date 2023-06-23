// 导入express 框架
const express = require('express')
const bodyParser = require('body-parser')
// 导入已封装的数据函数
const db = require('./config/db.js')
// 引入jwt token工具
const JwtUtil = require('./utils/jwt');
// 发送邮件工具
const emailApi = require('./utils/emailApi')

// 解决跨域模块
const cors = require('cors');
// 创建App应用程序
const app = express()
//解析json编码数据
app.use(bodyParser.json());
//解析url编码的数据
app.use(bodyParser.urlencoded({ extended: false }));
// 跨域访问
// 跨域资源共享 (Cross-origin resource sharing)
app.use(cors());
// 配置静态资源目录 整一个文件夹 通过域名能访问
app.use('/static',express.static("./static"))
// 测试
app.get('/', function (req, res) {
  res.send(`
      <h1>测试成功！</h1>
    `)
})

// 发送邮件
app.get('/sendEmail', async function (req, res) {
  let email = req.query.email;
  let rep = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (rep.test(email)) {
    emailApi.Email.getEmailCode(email)
      .then(
        () => {
          res.send({ code: 200, msg: "发送成功" })
        }
      )
  }else {
       res.send({ code: -1, msg: "邮箱格式不正确" })
  }
})

// app.use('/static',express.static('public'));

// 导入用户路由
const userRouter = require('./router/user/index');
app.use('/user',userRouter);
// 监听服务的端口
app.listen(3005, ()=> {
    console.log(`服务启动了，访问 http:127.0.0.1:3005`)
    console.log(`服务启动了，访问 http:localhost:3005`)
})