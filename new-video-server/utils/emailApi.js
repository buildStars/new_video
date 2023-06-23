const sendEmail = require('./sendEmail.js')
// 生成邮件ID
const { v4: uuidv4 } = require('uuid')
// 导入已封装的数据函数
const db = require('../config/db.js')

class Email {
    static async getEmailCode(client_email) {
        // 生成验证码
        let emailCode = Math.random().toString().slice(-6);
        //随机生成6位数字
        let email = {
            title: '优创视频---邮箱验证码',
            body: `
                    <h1>您好：</h1>
                    <p style="font-size: 18px;color:#000;">
                        您的验证码为：
                        <span style="font-size: 16px;color:#f00;"><b>${emailCode}</b>,</span>
                        <p>您当前正在优创视频网站注册账号，验证码告知他人将会导致数据信息被盗，请勿泄露!</p>
                    </p>
                    <p style="font-size: 1.5rem;color:#999;">120秒内有效</p>
                    `
        }
        let emailCotent = {
            from: '956330362@qq.com', // 发件人地址
            to: `${client_email}`, // 收件人地址，多个收件人可以使用逗号分隔
            subject: email.title, // 邮件标题
            html: email.body // 邮件内容
        };
        //发送邮件
        await sendEmail.send(emailCotent);
        // 写入数据库
        let cid = uuidv4();
        let code_check_sql = 'select * from code where cid = "'+cid+'"'
        db.query(code_check_sql,(err,rows)=>{
            if(err){
                console.log(err)
            }else {
                db.query("insert into code(cid,v1) values('" +cid + "','" + emailCode+ "')", (err) => {
                    if (err) {
                        console.log(err)
                    }else {
                        // 60秒后移除验证码
                        let d = setTimeout(()=>{
                            db.query("delete from  code where cid = '" + cid + "'", function (err) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    // '删除成功'
                                    console.log("1");
                                }
                                clearTimeout(d);
                            });
                        },120 * 1000)
                    }
                })
            }
        })
    }
}
module.exports = {
    Email
}