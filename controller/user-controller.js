const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const con = require("../middleware/sqlConnect");
const nodemailer = require("nodemailer");
const NodeCache = require("node-cache");

const getAllUser = async (req, res, next) => {
  let users;
  const { username, password } = req.body;
  if (username == "punitadmin" && password == "savior") {
    con.query(`select * from usercreds;`, (err, result) => {
      console.log(result);
      if (err) throw err;
      result.forEach((e) => {
        e.password = "*********";
      });
      return res.status(200).json(result);
    });
  } else {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  console.log(req.body);
  if (
    username == "" ||
    password == "" ||
    email == "" ||
    username == undefined ||
    password == undefined ||
    email == undefined
  ) {
    res.status(400).json({ message: "Error! Please enter values" });
  } else {
    function validatePassword(password) {
      const regex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      return regex.test(password);
    }

    if (!validatePassword(password)) {
      console.log(
        "❌ Password must include: uppercase, lowercase, number, special character, and be at least 8 characters long"
      );
      return res.status(400).json({
        message:
          "Password must include: uppercase, lowercase, number, special character, and be at least 8 characters long",
      });
    } else {
      let hashedPassword = await bcrypt.hash(password, 10);
      console.log(username, email, hashedPassword);
      con.query(
        `select * from usercreds where username = '${username}';`,
        (err, result) => {
          if (err) {
            existingUser = false;
          }
          let temp = result;
          if (
            temp != undefined &&
            temp.length > 0 &&
            temp[0].username == username.toLowerCase()
          ) {
            return res
              .status(400)
              .json({ message: "User already exists! Login instead" });
          } else {
            con.query(
              `CREATE TABLE IF NOT EXISTS usercreds(
                PersonID int NOT NULL AUTO_INCREMENT,
                username varchar(255) NOT NULL,
                password varchar(255) NOT NULL,
                email varchar(255) NOT NULL,
                PRIMARY KEY (PersonID) 
                );`,
              function (err, result) {
                if (err) {
                  return res
                    .status(400)
                    .json({ message: "Unable to create the table" });
                } else {
                  con.query(
                    `insert into usercreds (username, password,email) values(?,?,?);`,
                    [username, hashedPassword, email.toLowerCase()],
                    (err, result) => {
                      if (err) {
                        return res
                          .status(400)
                          .json({ message: "Unable to insert into table" });
                      } else {
                        console.log("user added to db", result);
                        res.status(201).json("Registration success");
                      }
                    }
                  );
                }
                console.log("Table created if not exist", result);
              }
            );
          }
        }
      );
    }
  }
};

const login = async (req, res, next) => {
  var { username, password } = req.body;
  if (username.includes("@")) username = username.split("@")[0];
  username = username.toLowerCase();
  console.log(username, password);
  con.query(
    `select * from usercreds where username = ?;`,
    [username],
    (err, result) => {
      if (err) throw err;
      let temp = result;
      if (
        temp != undefined &&
        temp.length > 0 &&
        (temp[0].email == username || temp[0].email.split("@")[0] == username)
      ) {
        let existingUser = temp[0];
        console.log(existingUser.password);
        if (password != undefined && password != "") {
          bcrypt.compare(password, existingUser.password).then((response) => {
            console.log(response);
            if (response) {
              const accessToken = jwt.sign(
                { id: existingUser.PersonID },
                "secret123",
                {
                  expiresIn: "200s",
                }
              );
              //   console.log(accessToken);
              return res.status(200).json({
                message: "Login Successfull",
                user: existingUser,
                token: accessToken,
              });
            } else {
              return res.status(401).json({ message: "Password Incorrect" });
            }
          });
        } else {
          return res.status(404).json({ message: "Please enter the password" });
        }
      } else {
        return res
          .status(404)
          .json({ message: "Username does not exist, Please SignUp" });
      }
    }
  );
};
const updateUserDetailsQuery = async (req, res, next) => {
  const {
    userid,
    username,
    email,
    address,
    city,
    state,
    zipcode,
    country,
    contact,
    phone,
    dob,
    contracted_users,
    user_type,
  } = req.body;

  const query = `UPDATE userdetails SET username = ?, email = ?, address = ?, city = ?, state = ?, zipcode = ?, country = ?, contact = ?, phone = ?, dob = ?, contracted_users = ?,user_type=? WHERE userid = ?`;
  const values = [
    username,
    email,
    address,
    city,
    state,
    zipcode,
    country,
    contact,
    phone,
    dob,
    Array.isArray(contracted_users)
      ? JSON.stringify(contracted_users)
      : JSON.stringify([]),
    user_type,
    userid,
  ];
  if (!userid || typeof userid !== "number") {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  con.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating user details:", err);
      return res.status(500).json({ message: "Error updating user details" });
    }
    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: "User details updated successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
};

const insertUserDetails = async (req, res, next) => {
  const {
    userid,
    username,
    email,
    address,
    city,
    state,
    zipcode,
    country,
    contact,
    phone,
    dob,
    contracted_users,
    user_type,
  } = req.body;
  const query = `INSERT INTO userdetails (userid, username, email, address, city, state, zipcode, country, contact, phone, dob, contracted_users, user_type  ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  const values = [
    userid,
    username,
    email,
    address,
    city,
    state,
    zipcode,
    country,
    contact,
    phone,
    dob,
    Array.isArray(contracted_users)
      ? JSON.stringify(contracted_users)
      : JSON.stringify([]),
    user_type,
  ];
  con.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting user details:", err);
      return res.status(500).json({ message: "Error inserting user details" });
    }
    return res
      .status(201)
      .json({ message: "User details inserted successfully" });
  });
};

const updateUserDetails = async (req, res, next) => {
  const {
    userid,
    username,
    email,
    address,
    city,
    state,
    zipcode,
    country,
    contact,
    phone,
    dob,
    contracted_users,
    user_type,
  } = req.body;
  if (!userid || !username || !email) {
    return res
      .status(400)
      .json({ message: "User ID, username and email are required" });
  }
  con.query(
    `CREATE TABLE IF NOT EXISTS userdetails(
    userid INT NOT NULL,
    username varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    address varchar(255),
    city varchar(255),
    state varchar(255),
    zipcode varchar(20),
    country varchar(255),
    contact varchar(255),
    phone varchar(20),
    dob DATE,
    contracted_users JSON,
    user_type varchar(50),
    PRIMARY KEY (userid)
    );`,
    (err, result) => {
      if (err) {
        console.error("Error creating userdetails table:", err);
        return res
          .status(500)
          .json({ message: "Error creating userdetails table" });
      }
      console.log("User details table created or already exists");
    }
  );
  con.query(
    `select * from userdetails where username = '${username}' or userid='${userid}';`,
    [username, userid],
    (err, result) => {
      if (err) {
        console.error("Error updating user details:", err);
      }
      if (result && result.length == 0) {
        insertUserDetails(req, res, next);
      } else {
        updateUserDetailsQuery(req, res, next);
      }
    }
  );
};

const otpCache = new NodeCache({ stdTTL: 600 }); // OTPs will expire in 10 minutes

const sendOTP = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

  // Store the OTP in the in-memory store with an expiration time
  otpCache.set(email, otp);

  // Send the OTP via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "punithashunmugam15@gmail.com",
      pass: "shunmugam1032",
    },
  });

  const mailOptions = {
    from: "punithashunmugam4@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Error sending OTP email" });
    } else {
      return res.status(200).json({ message: "OTP sent successfully" });
    }
  });
};

const verifyOTP = (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const storedOtp = otpCache.get(email);
  if (storedOtp === undefined) {
    return res
      .status(400)
      .json({ message: "OTP has expired or does not exist" });
  }

  if (storedOtp === otp) {
    otpCache.del(email); // Remove OTP after successful verification
    return res
      .status(200)
      .json({ otp_sent: false, message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
};

module.exports = { getAllUser, signUp, login, updateUserDetails };
