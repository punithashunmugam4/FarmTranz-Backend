const express = require("express");
const {
  getAllData,
  addData,
  deleteData,
  getByUsername,
  addBids,
  getMyProducts,
  getVisibleLoads,
  getMybids,
} = require("../controller/data-controller");
const auth = require("../middleware/authenticate");
const DataRouter = express.Router();

DataRouter.get("/", auth, getAllData); // don't use in APP only for admin
DataRouter.get("/getmyproducts", auth, getMyProducts);
DataRouter.get("/getvisibleloads", auth, getVisibleLoads);
DataRouter.get("/getmybids", auth, getMybids);
DataRouter.post("/addload", auth, addData);
DataRouter.delete("/", auth, deleteData);
DataRouter.get("/:username", auth, getByUsername);
DataRouter.patch("/addbids", auth, addBids);

module.exports = DataRouter;
