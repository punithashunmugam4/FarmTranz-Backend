const express = require("express");
const {
  getAllUser,
  signUp,
  login,
  updateUserDetails,
} = require("../controller/user-controller");
const auth = require("../middleware/authenticate");

const router = express.Router();

router.get("/", getAllUser);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/update", auth, updateUserDetails);

module.exports = router;

// shunmugam - 12346
// samantha - 123456
// punitha - 1235468
//sumathi - 00000
// prema - Sprema$1
