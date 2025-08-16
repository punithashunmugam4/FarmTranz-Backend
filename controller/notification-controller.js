const con = require("../middleware/sqlConnect");

const getMyNotification = async (req, res, next) => {
  const username = req.username;
  try {
    con.query(
      `CREATE TABLE IF NOT EXISTS notifications(
    id integer auto_increment,
    username varchar(50) not null ,
    message varchar(255) not null ,
    is_read boolean default false ,
    createdAt TIMESTAMP default current_timestamp ,
    PRIMARY KEY (id)
    );`,
      (err, res) => {
        if (err) throw err;
      }
    );

    con.query(
      `select * from notifications where username= ?`,
      [username],
      function (err, result) {
        if (err) throw err;
        console.log(result.length);
        if (!result) {
          return res.status(404).json({ message: "No Notifications found" });
        }
        con.query(
          `DELETE FROM notifications WHERE username=? AND id NOT IN (SELECT id from (SELECT id FROM notifications WHERE username=? ORDER BY createdAt DESC LIMIT 20) as t)`,
          [username, username],
          (err, result) => {
            if (err) throw err;
            console.log("Old notification removed successfully");
          }
        );
        return res.status(200).json({ result });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

const sendNotification = async (req, res, next) => {
  const { username, message } = req.body;

  try {
    con.query(
      `CREATE TABLE IF NOT EXISTS notifications(
    id integer auto_increment,
    username varchar(50) not null ,
    message varchar(255) not null ,
    is_read boolean default false ,
    createdAt TIMESTAMP default current_timestamp ,
    PRIMARY KEY (id)
    );`,
      (err, res) => {
        if (err) throw err;
      }
    );

    con.query(
      `INSERT INTO notifications (username, message) VALUES (?, ?)`,
      [username, message],
      function (err, result) {
        if (err) throw err;
        return res
          .status(200)
          .json({ message: "Notification sent successfully" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending notification" });
  }
};

const clearMyNotification = async (req, res, next) => {
  const username = req.username;
  try {
    con.query(
      `DELETE FROM notifications WHERE username=?`,
      [username, username],
      (err, result) => {
        if (err) throw err;
        return res
          .status(200)
          .json({ message: "Notification Cleared successfully" });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error clearing notification" });
  }
};

const markAsReadUnRead = async (req, res, next) => {
  const { is_read, id } = req.body;
  try {
    con.query(
      `select * from notifications where id= ?`,
      [id],
      function (err, result) {
        if (err) throw err;
        console.log(result.length);
        if (!result) {
          return res.status(404).json({ message: "No Notifications found" });
        }
        con.query(
          `UPDATE notifications SET is_read = ? WHERE id = ?;`,
          [is_read, id],
          function (err, result) {
            if (err) throw err;
            return res.status(200).json({ result });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

const markAllread = (req, res, next) => {
  const username = req.username;
  try {
    con.query(
      `select * from notifications where username= ?`,
      [username],
      function (err, result) {
        if (err) throw err;
        console.log(result.length);
        if (!result) {
          return res.status(404).json({ message: "No Notifications found" });
        }
        if (result.length > 0) {
          result.map((item) => {
            con.query(
              `UPDATE notifications SET is_read = ? WHERE id = ?;`,
              [true, item.id],
              function (err, result) {
                if (err) throw err;
              }
            );
          });
          return res.status(200).json({ result });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating notifications" });
  }
};

module.exports = {
  getMyNotification,
  sendNotification,
  clearMyNotification,
  markAsReadUnRead,
  markAllread,
};
