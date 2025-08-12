const mysql = require("mysql2");
var con = mysql.createConnection({
  host: "192.168.1.6",
  user: "shunmugam",
  password: "punitha",
  database: "farmTranz",
  port: 3306,
  connectTimeout: 10000, // optional: increase timeout
});
con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
module.exports = con;

// host: "127.0.0.1",
// user: "root",
// password: "shunmugam1502"
