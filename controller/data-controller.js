const User = require("../routes/user-routes");
const con = require("../middleware/sqlConnect");
const auth = require("../middleware/authenticate");

const getAllData = async (req, res, next) => {
  con.query(`select * from load_details`, function (err, result) {
    if (err) throw err;
    console.log(result.length);
    if (!result) {
      return res.status(404).json({ message: "No Data found" });
    }
    return res.status(200).json({ result });
  });
};

const getMyProducts = async (req, res, next) => {
  if (req.username) {
    // If username is provided, get data by username
    const username = req.username;
    con.query(
      `select * from load_details where name = ?`,
      [username],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Unable to fetch data" });
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "No Data found" });
        }
        return res.status(200).json({ result });
      }
    );
    return;
  }
};

const getVisibleLoads = async (req, res, next) => {
  // Get all loads that are visible to the user
  const username = req.username;
  con.query(
    `select * from load_details where visible_user like ? or visible_user = '[]'`,
    [`%${username}%`],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch data" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "No Data found" });
      }
      return res.status(200).json({ result });
    }
  );
};

const getMybids = async (req, res, next) => {
  // Get all loads that are visible to the user
  const username = req.username;
  con.query(
    `select * from load_details where all_bids like ?`,
    [`%${username}%`],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch data" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "No Data found" });
      }
      return res.status(200).json({ result });
    }
  );
};

const addData = async (req, res, auth) => {
  const {
    auction_id,
    contact,
    pick_up_range_start_date,
    pick_up_range_end_date,
    product_location,
    product,
    min_bid,
    max_bid,
    distance,
    weight,
    quantity,
    product_grade,
    image_path,
    visible_user,
    additional_info,
    all_bids,
    auction_time_hrs,
    category,
  } = req.body;
  const { username, email } = req;
  console.log("Adding data for user:", username, email);
  let data = { ...req.body, name: username, email }; // Add name and email from authenticated user
  console.log(data);
  let keys = Object.keys(req.body);

  const insertdata = () => {
    const allColumns = [
      "name",
      "email",
      "product_location",
      "product",
      "category",
      "weight",
      "distance",
      "quantity",
      "contact",
      "product_grade",
      "additional_info",
      "pick_up_range_start_date",
      "pick_up_range_end_date",
      "all_bids",
      "min_bid",
      "max_bid",
      "visible_user",
      "image_path",
      "auction_time_hrs",
      "status",
    ];
    const columns = [];
    const placeholders = [];
    const values = [];
    allColumns.forEach((col) => {
      if (typeof data[col] !== "undefined") {
        columns.push(col);
        placeholders.push("?");
        // Stringify JSON fields if needed
        if (
          [
            "product_location",
            "all_bids",
            "max_bid",
            "visible_user",
            "image_path",
          ].includes(col)
        ) {
          values.push(JSON.stringify(data[col]));
        } else {
          values.push(data[col]);
        }
      }
    });
    let required_keys = [
      "name",
      "email",
      "contact",
      "pick_up_range_start_date",
      "pick_up_range_end_date",
      "product_location",
      "product",
      "category",
      "auction_time_hrs",
      "min_bid",
      "weight",
    ];
    let missingfield = required_keys.filter((a) => {
      console.log(data[a]);
      if (!data[a]) {
        return true;
      }
    });
    let missingresult = "";
    if (missingfield.length > 0) {
      missingfield.forEach((element) => {
        missingresult += `${element} field is missing\n`;
      });
      console.log(missingresult);
    }
    if (missingresult != "" || missingfield.length > 0) {
      res.status(400).json({ message: missingresult });
    }
    let optional_defaults = {
      max_bid: {},
      distance: 0,
      quantity: "",
      product_grade: "",
      image_path: [],
      visible_user: [],
      additional_info: "",
      all_bids: [],
    };

    Object.keys(optional_defaults).forEach((key) => {
      if (typeof data[key] === "undefined" || data[key] === null) {
        data[key] = optional_defaults[key];
      }
    });

    const sql = `INSERT INTO load_details (${columns.join(
      ", "
    )}) VALUES (${placeholders.join(", ")})`;
    con.query(sql, values, function (err, result) {
      if (err) throw err;
      else {
        console.log("Insert result is  " + result);
        res.status(201).json({
          message: "Data added successfully",
          auction_id: auction_id,
        });
        console.log("details added");
      }
    });
  };
  const update_data = () => {
    keys.forEach((e) => {
      const query = `UPDATE load_details SET ${e} = ? WHERE auction_id = ?;`;
      if (typeof data[e] === "object") {
        data[e] = JSON.stringify(data[e]);
      }
      con.query(query, [data[e], auction_id], (err, result) => {
        if (err) {
          console.error("Error updating column:", e, err);
          return res.status(500).json({
            message: "Error updating column: " + e,
          });
        } else {
          console.log(`✅ Updated ${e} successfully`, result);
        }
      });
    });
    return res.status(201).json({
      message: "Data updated successfully",
      auction_id: auction_id,
    });
  };

  const add_data = () => {
    if (auction_id) {
      con.query(
        `select * from load_details where auction_id = ? and name = ?`,
        [auction_id, username],
        function (err, result) {
          if (err) {
            return res.status(500).json({
              message: "Error fetching data for auction_id",
            });
          }
          console.log(result.length);
          if (result && result.length > 0) {
            console.log("Already exist");
            update_data();
          } else {
            return res.status(500).json({
              message: "Invalid auction_id",
            });
          }
        }
      );
    } else insertdata();
  };
  con.query(
    `CREATE TABLE IF NOT EXISTS load_details(
name varchar(50) NOT NULL,
email varchar(50) NOT NULL,
auction_id integer auto_increment,
product_location JSON NOT NULL,
product varchar(25) NOT NULL,
category varchar(25) NOT NULL,
weight FLOAT NOT NULL,
distance FLOAT ,
quantity varchar(50) NOT NULL,
contact varchar(25) NOT NULL,
product_grade varchar(5) NOT NULL,
additional_info varchar(100) NOT NULL,
pick_up_range_start_date DATE NOT NULL,
pick_up_range_end_date DATE,
all_bids JSON,
min_bid FLOAT NOT NULL,
max_bid json,
visible_user json,
 image_path json,
 status varchar(25),
 auction_time_hrs integer not null,
PRIMARY KEY (auction_id),
createdAt TIMESTAMP default current_timestamp
);`,
    function (err, result) {
      if (err) {
        throw err;
      }
      console.log("Table created");
    }
  );
  add_data();
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  con.query(
    `select * from load_details where auction_id = ?`,
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to fetch data" });
      }
      console.log(result);
      if (!result) {
        return res.status(404).json({ message: "No Data found" });
      }
      return res.status(200).json({ result });
    }
  );
};

const getByUsername = async (req, res, next) => {
  // get By Username or auction_id
  const username = req.params.username;
  if (parseInt(username)) {
    let auction_id = username;
    console.log(auction_id);
    con.query(
      `select * from load_details where auction_id = ?`,
      [auction_id],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Unable to fetch data" });
        }
        console.log(result);
        if (result.length === 0) {
          return res.status(404).json({ message: "No Data found" });
        }
        return res.status(200).json({ result });
      }
    );
  } else {
    console.log(username);
    con.query(
      `select * from load_details where name = ?`,
      [username],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Unable to fetch data" });
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "No Data found" });
        }
        return res.status(200).json({ result });
      }
    );
  }
};

const deleteData = async (req, res, next) => {
  // Delete a load by auction_id
  const auction_id = req.query.auction_id;
  console.log(auction_id);
  con.query(
    `delete from load_details where auction_id = ? and name = ?`,
    [auction_id, req.username],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to delete" });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "No Data found or not authorized" });
      }

      return res.status(200).json({ message: "Successfully deleted" });
    }
  );
};

const addBids = async (req, res, next) => {
  const bidder = req.username;
  const { auction_id, bid_amount } = req.body;
  const bid = { name: bidder, submit_amount: bid_amount };
  console.log("auction: ", auction_id, "bid: ", bid);

  con.query(
    `select * from load_details where auction_id=?`,
    [auction_id],
    function (err, result) {
      if (err) throw err;
      if (!result) {
        return res.status(404).json({ message: "No Data found" });
      }
      data = result;
      if (!data || data.length === 0) {
        console.log("No data found for auction_id: ", auction_id);
        return res.status(404).json({ message: "No Data found" });
      }

      let all_bids = data[0].all_bids > 0 ? datadata[0].all_bids : [];
      let max_bids = data[0].max_bid;
      console.log("Existing max bid: ", max_bids);
      let bid_exists =
        all_bids.length > 0 ? all_bids.some((e) => e.name === bid.name) : false;
      if (bid_exists) {
        if (
          bid.submit_amount === undefined ||
          bid.submit_amount === null ||
          bid.submit_amount == "" ||
          bid.submit_amount == 0
        ) {
          all_bids = all_bids.filter((e) => e.name !== bid.name); // remove the bid if submit_amount is not provided
          if (max_bids.name === bid.name) {
            max_bids = all_bids.reduce(
              (max, b) =>
                parseFloat(b.submit_amount) > parseFloat(max.submit_amount)
                  ? b
                  : max,
              all_bids[0]
            );
            console.log("Max bid updated: ", max_bids);
          }
          console.log("Bid removed: ", all_bids);
        } else {
          all_bids.map((e) => {
            if (e.name === bid.name) {
              e["submit_amount"] = bid.submit_amount;
            }
          });
          if (max_bids.name === bid.name) {
            max_bids = all_bids.reduce(
              (max, b) =>
                parseFloat(b.submit_amount) > parseFloat(max.submit_amount)
                  ? b
                  : max,
              all_bids[0]
            );
            console.log("Max bid updated: ", max_bids);
          }

          console.log("Bid added: ", all_bids);
        }
      } else {
        if (bid_amount < data[0].min_bid) {
          return res
            .status(400)
            .json({ message: "Bid amount is less than minimum bid" });
        }
        all_bids.push(bid);
        console.log(" maxbids.submitaount: ", max_bids.submit_amount);
        if (
          !max_bids.submit_amount ||
          parseFloat(bid.submit_amount) > parseFloat(max_bids.submit_amount)
        ) {
          max_bids = bid;
          console.log("Max bid updated: ", max_bids);
        }
        console.log("New Bid added: ", all_bids);
      }

      con.query(
        `UPDATE load_details
SET all_bids = ?
WHERE auction_id = ?;`,
        [JSON.stringify(all_bids), auction_id],
        function (err, result) {
          if (err) throw err;
          else {
            // console.log(result);
            con.query(
              `UPDATE load_details SET max_bid = ? WHERE auction_id = ?;`,
              [JSON.stringify(max_bids), auction_id],
              function (err, result) {
                if (err) throw err;
                else {
                  console.log(result);
                }
              }
            );
            return res.status(201).json({ message: "Bid added successfully" });
          }
        }
      );

      // console.log("data: ", data);
    }
  );
};

module.exports = {
  getAllData,
  addData,
  getById,
  deleteData,
  getByUsername,
  addBids,
  getMyProducts,
  getVisibleLoads,
  getMybids,
};
