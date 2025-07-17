const mysql = require("mysql2");
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "shunmugam1502",
  database: "farmTranz",
});
con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
module.exports = con;
