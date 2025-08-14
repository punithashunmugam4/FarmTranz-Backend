const express = require("express");
const {
  signUp,
  login,
  updateUserDetails,
  getUserDetails,
  getAllUserDetails,
} = require("../controller/user-controller");
const auth = require("../middleware/authenticate");

const router = express.Router();

router.post("/getalluserdetails", getAllUserDetails);
router.post("/signup", signUp);
router.post("/login", login);
router.put("/update", auth, updateUserDetails);
router.get("/getuserdetails", auth, getUserDetails);
router.get("/validate", auth, (req, res, next) => {
  console.log("Req user: ", req.username);
  console.log("Req userid: ", req.userid);
  res.status(200).json({
    username: req.username,
    userid: req.userid,
    message: "User is authenticated",
  });
});

module.exports = router;

// shunmugam - 123456
// samantha - 123456
// punitha - 123456
//sumathi - 123456
// prema - 123456
//shunmugam2 - 123456
