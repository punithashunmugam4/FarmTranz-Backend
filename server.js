// shunmugam
// pw - punitha

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const dataRouter = require("./routes/data-routes");
const router = require("./routes/user-routes");

const app = express();

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "shunmugam1502",
});

app.use(express.json());
app.use(cors());
con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
  con.query(`use farmTranz;`, function (err, result) {
    console.log(result);
    if (err) {
      con.query(`CREATE DATABASE farmTranz;`, function (err, result) {
        console.log(result);
        if (err) {
          throw err;
        }
        console.log("Database created");
      });
    }
    console.log("Database connected");
  });
});

app.listen(3500, (err) => {
  if (err) console.log("error starting server");
  console.log("server is listening to port: 3500");
});

// const users = [];
// const sessions = [];
app.use("/api/user", router); // if we have const portal in url we can give as app.use('/api/user',router) whatever we give path will be added to given path
app.use("/api/data", dataRouter);
