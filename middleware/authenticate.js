const jwt = require("jsonwebtoken");
const con = require("./sqlConnect");

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, "secret123", async (err, user) => {
    if (err) return res.sendStatus(403);
    console.log(user.id);
    con.query(
      `select * from usercreds where PersonID = '${user.id}';`,
      (err, res) => {
        const userFound = res[0].user;
        req.user = userFound;
        next();
      }
    );
  });
};

module.exports = auth;
