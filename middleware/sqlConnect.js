const mysql = require("mysql2");
var con = mysql.createConnection({
  host: "103.26.110.189",
  user: "shunmugam",
  password: "punitha",
  database: "farmTranz",
});
con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
module.exports = con;

// host: "127.0.0.1",
// user: "root",
// password: "shunmugam1502"
