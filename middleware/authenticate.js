const jwt = require("jsonwebtoken");
const con = require("./sqlConnect");

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, "secret123", async (err, user) => {
    if (err) {
      console.log("Authentication error:", err);
      return res.sendStatus(403);
    }
    con.query(
      `select * from userdetails where userid = '${user.id}';`,
      (err, res) => {
        req.username = res[0].username;
        req.userid = user.id;
        req.email = res[0].email;
        next();
      }
    );
  });
};

module.exports = auth;
