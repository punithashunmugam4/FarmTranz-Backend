const express = require("express");
const {
  getAllData,
  addData,
  deleteData,
  getByUsername,
  addBids,
} = require("../controller/data-controller");
const auth = require("../middleware/authenticate");
const DataRouter = express.Router();

DataRouter.get("/", getAllData);
DataRouter.post("/add", auth, addData); // add auth later
DataRouter.delete("/:id", deleteData);
DataRouter.get("/:username", auth, getByUsername);
DataRouter.patch("/addbids", addBids);

module.exports = DataRouter;
