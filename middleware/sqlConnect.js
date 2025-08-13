require("dotenv").config();
const mysql = require("mysql2");
var con = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});
con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
module.exports = con;

// host: "127.0.0.1",
// user: "root",
// password: "shunmugam1502"

// host: "103.26.110.189",  103.160.240.150
// user: "punitha",
// password: "punitha1502",
// database: "farmTranz",

//  host: "192.168.1.6",
//   user: "shunmugam",
//   password: "punitha",
//   database: "farmTranz",

//  host: process.env.DB_HOST,
//  user:process.env.DB_USER,
//  password:process.env.DB_PASS,
//  database:process.env.DB_NAME

// host: "mysql.railway.internal",
// user: "root",
// password: "YMYUqnfDbCiYIyJBHuZlOZJauEOCFyAU",
// database: "railway",
// port: "3306",
