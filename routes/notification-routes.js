const express = require("express");
const {
  getMyNotification,
  sendNotification,
  clearMyNotification,
  markAsReadUnRead,
  markAllread,
} = require("../controller/notification-controller");
const auth = require("../middleware/authenticate");
const NotificationRouter = express.Router();

NotificationRouter.get("/", auth, getMyNotification); // don't use in APP only for admin
NotificationRouter.post("/notify", auth, sendNotification);
NotificationRouter.delete("/clear", auth, clearMyNotification);
NotificationRouter.put("/readunread", auth, markAsReadUnRead);
NotificationRouter.put("/readunreadall", auth, markAllread);

module.exports = NotificationRouter;
