require("dotenv").config();
const mysql = require("mysql2");
var con = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT,
});
con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = con;
