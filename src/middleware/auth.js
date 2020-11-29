const jwt = require("jsonwebtoken");
const User = require("../models/user");

const secretKey = process.env.SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, secretKey);
    // console.log("decoded : ", decoded);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    // console.log("Token received: ", token);
    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    console.log("User Authenticated!!");
    next();
  } catch (e) {
    console.log("Authenticating failed!!", secretKey);
    res.send({ error: "Authentication failed." });
  }
};

module.exports = auth;
