var mysql = require('mysql');
var dbconfig = require('./database.js');
// 使用连接池
var pool = mysql.createPool(dbconfig.mysql);
// 使用连接池
var pool = mysql.createPool(dbconfig.mysql);
module.exports = {
    query: async function (sql, params = false, callback) {
        await pool.getConnection(function (err, connection) {
             connection.query(sql, params, function (err, rows) {
                callback(err, rows);
                connection.release();
            })
        })
    }
}