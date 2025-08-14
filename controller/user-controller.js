const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const con = require("../middleware/sqlConnect");
const nodemailer = require("nodemailer");
const NodeCache = require("node-cache");

const getAllUserDetails = async (req, res, next) => {
  const { username, password } = req.body;
  if (username == "punitadmin" && password == "savior") {
    con.query(`select * from userdetails;`, (err, result) => {
      console.log(result);
      if (err) throw err;
      return res.status(200).json(result);
    });
  } else {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

const signUp = async (req, res, next) => {
  con.query(
    `CREATE TABLE IF NOT EXISTS userdetails(
userid integer auto_increment,
name varchar(50) NOT NULL ,
email varchar(50) NOT NULL unique,
username varchar(50) NOT NULL unique,
address varchar(255)  NOT NULL,
city varchar(255)  NOT NULL,
state varchar(255)  NOT NULL,
zipcode varchar(255)  NOT NULL,
country varchar(255)  NOT NULL,
contact varchar(25) NOT NULL,
dob DATE NOT NULL,
contract_users json,
password varchar(255) not null,
PRIMARY KEY (userid),
createdAt TIMESTAMP default current_timestamp
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

  const {
    name,
    email,
    address,
    city,
    state,
    zipcode,
    country,
    contact,
    dob,
    contract_users,
    password,
  } = req.body;
  console.log(req.body);

  if (
    password == "" ||
    email == "" ||
    password == undefined ||
    email == undefined
  ) {
    res.status(400).json({ message: "Error! Please enter values" });
  } else {
    function validatePassword(password) {
      // const regex =
      //   /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      // return regex.test(password);
      return true; //test code
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
      let username = email.split("@")[0].toLowerCase();
      console.log(username, hashedPassword);
      con.query(
        `select * from userdetails where username =? or email= ?;`,
        [username, email],
        (err, result) => {
          if (err) {
            existingUser = false;
          }
          let temp = result;
          if (temp && temp.length > 0) {
            return res
              .status(400)
              .json({ message: "User/Mail id already exists! Login instead" });
          } else {
            const query = `INSERT INTO userdetails ( name, username,email, address, city, state, zipcode, country, contact, dob, contract_users,password  ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)`;
            const values = [
              name,
              username,
              email.toLowerCase(),
              address,
              city,
              state,
              zipcode,
              country,
              contact,
              dob,
              Array.isArray(contract_users)
                ? JSON.stringify(contract_users)
                : JSON.stringify([]),
              hashedPassword,
            ];
            con.query(query, values, (err, result) => {
              if (err) {
                console.error("Error inserting user details:", err);
                return res
                  .status(500)
                  .json({ message: "Error inserting user details" });
              }
              return res
                .status(201)
                .json({ message: "User details inserted successfully" });
            });
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
    `select * from userdetails where username = ?;`,
    [username],
    (err, result) => {
      if (err) throw err;
      let temp = result;
      if (
        temp != undefined &&
        temp.length > 0 &&
        (temp[0].username == username ||
          temp[0].email == username ||
          temp[0].email.split("@")[0] == username)
      ) {
        let existingUser = temp[0];
        console.log(existingUser.password);
        if (password != undefined && password != "") {
          bcrypt.compare(password, existingUser.password).then((response) => {
            console.log(response);
            if (response) {
              const accessToken = jwt.sign(
                { id: existingUser.userid },
                "secret123",
                {
                  expiresIn: "2000s",
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

const updateUserDetails = async (req, res, next) => {
  let userid = req.userid;
  let username = req.username;
  let keys = Object.keys(req.body);
  let data = { ...req.body, userid };
  keys.forEach((e) => {
    const query = `UPDATE userdetails SET ${e} = ? WHERE userid = ?;`;
    if (typeof data[e] === "object") {
      data[e] = JSON.stringify(data[e]);
    }
    con.query(query, [data[e], userid], (err, result) => {
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
    userid: userid,
    username: username,
  });
};

const getUserDetails = async (req, res, next) => {
  const username = req.query.username || req.username; // query - Mean user seeing other users details otherwise username from token being used for seeing own profile
  console.log("Fetching user details for:", username);
  if (!username) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  con.query(
    `SELECT * FROM userdetails WHERE username = ?;`,
    [username],
    (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err);
        return res.status(500).json({ message: "Error fetching user details" });
      }
      console.log(result);
      if (result.length > 0) {
        const userDetails = result[0];
        if (req.query.username) {
          userDetails.password = "hidden"; // Mean user seeing other users details
        }

        // Parse JSON fields if they exist
        if (userDetails.contract_users) {
          userDetails.contract_users = userDetails.contract_users;
        } else {
          userDetails.contract_users = [];
        }
        return res.status(200).json(userDetails);
      } else {
        return res.status(404).json({ message: "User not found" });
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

module.exports = {
  getAllUserDetails,
  signUp,
  login,
  updateUserDetails,
  getUserDetails,
};
