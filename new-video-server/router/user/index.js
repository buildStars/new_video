const express = require('express')
// 生成ID
const {
    v4: uuidv4
} = require('uuid')
// 引入jwt token工具
const JwtUtil = require('../../utils/jwt');
const db = require('../../config/db.js')
const router = express.Router()
router.post('/register', function (req, res) {
    let id = uuidv4() || Math.random().toString().slice(2);
    let userName = req.body.userName; // 用户名
    let passWord = req.body.passWord; // 密码
    let email = req.body.user; //  邮箱
    let phone = req.body.phone; //  手机号
    let v1 = req.body.v1;
    let time = req.body.time || '2022-09-29 00:00:00'; //  用户创建的时间
    // 注册逻辑
    const register = () => {
        // 查询用户表
        let user_check_sql = 'select * from user where email="' + email + '" or phone = "' + phone + '"';
        db.query(user_check_sql, (err, rows) => {
            if (err) {
                res.send({
                    code: -1,
                    msg: '查询失败'
                })
            } else {
                // 解构赋值(数据库)
                if (rows && rows.length != 0) {
                    let [user] = rows;
                    if (user.email == email || user.phone == phone) {
                        res.send({
                            code: 201,
                            msg: '用户已存在'
                        })
                    } else {
                        res.send({
                            code: 501,
                            msg: '后端异常'
                        })
                    }
                } else {
                    // 添加用户
                    let user_insert_sql = 'insert into user (userName,passWord,id,email,phone,time) values (?,?,?,?,?,?)';
                    let params = [userName, passWord, id, email, phone, time]
                    db.query(user_insert_sql, params, (err) => {
                        if (err) {
                            res.send({
                                code: -1,
                                msg: '注册失败'
                            })
                        } else {
                            res.send({
                                code: 200,
                                msg: '注册成功',
                                userName: userName
                            });
                        }
                    })
                }
            }
        })
    }
    if (v1) {
        let code_check_sql = 'select * from code where v1 = "' + v1 + '"'
        db.query(code_check_sql, (err, rows) => {
            if (err) {
                res.send({
                    code: -1,
                    msg: '服务异常'
                })
            } else {
                if (rows && rows.length != 0) {
                    let arr = [...rows].filter(item => {
                        if (item.v1 == v1) {
                            return item;
                        }
                    })
                    if (arr.length == 1) {
                        let code_check_sql2 = 'select * from code where v1 = "' + v1 + '" and cid = "' + arr[0].cid + '"';
                        db.query(code_check_sql2, (err, rows) => {
                            if (err) {
                                res.send({
                                    code: -1,
                                    msg: '邮箱验证失败'
                                })
                            } else {
                                // 验证通过 , 再注册
                                register();
                            }
                        })
                    } else {
                        res.send({
                            code: -1,
                            msg: '验证码冲突了，请重新发送'
                        })
                    }
                } else {
                    res.send({
                        code: 200,
                        msg: '验证码错误'
                    })
                }
            }
        })
    } else {
        res.send({
            code: 404,
            msg: '请发送邮箱验证码'
        })
    }
})
// 查询数据(登录)
router.post('/login', function (req, res) {
    // let userName = req.body.userName;
    let passWord = req.body.passWord;
    let email = req.body.email;
    let phone = req.body.email;
    // 查询用户表
    let user_check_sql = 'select * from user where passWord="' + passWord + '" and email="' + email + '" or phone = "' + phone + '"';
    db.query(user_check_sql, (err, rows) => {
        if (err) {
            res.send({
                code: -1,
                msg: '登录失败'
            })
        } else {
            if (rows && rows.length == 0) {
                res.send({
                    code: 404,
                    msg: '账号或密码错误'
                });
            } else {
                let [{
                    id,
                    userName,
                    email,
                    phone
                }] = rows;
                // 将用户id传入并生成token
                let jwt = new JwtUtil(id);
                // 获取token
                let token = jwt.generateToken();
                // 将 token 返回给客户端
                res.send({
                    code: 200,
                    msg: '登录成功',
                    token,
                    userName,
                    email,
                    phone
                });

            }
            
        }
    })
})
router.get('/my', function (req, res) {
    let jwt = new JwtUtil(req.query.token);
    let result = jwt.verifyToken();
    let user_id = jwt.verifyToken().data

    // 接收前端传递的用户ID
    // console.log('xxx',id)
    // 查询语句
    let sql = 'select * from user where  id = "' + user_id + '"';
    // 调用查询方法
    if (result == 'err') {
        res.send({
            code: -1,
            msg: '登录已过期,请重新登录'
        });
    } else {
        db.query(sql, function (err, rows) {
            if (err) {
                res.send({
                    code: -1,
                    msg: '查询失败'
                })
            } else {
                res.send({
                    code: 200,
                    result: rows
                });
            }
        });
    }

})
module.exports = router