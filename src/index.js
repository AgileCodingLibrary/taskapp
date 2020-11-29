const express = require("express");
const userRoute = require("./routes/user");
const taskRoute = require("./routes/task");
require("./db/mongoose");
const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

app.listen(port, () => {
  console.log("Server up and running at port : ", port);
});

//test middleware
// app.use((req, res, next) => {
//   if (req.method === "GET") {
//     res.send("Get request is not allowed");
//   } else {
//     next();
//   }
// });

// app.use((req, res, next) => {
//   res.status(503).send("Site is under maintenance. Please visit again.");
// });

//test crypt functionality
// const bcrypt = require("bcryptjs");
// const password = "Abcd1234";
// const hashGivenPassword = async (pass) => {
//   const hashedPassword = await bcrypt.hash(pass, 8);
//   console.log(pass);
//   console.log(hashedPassword);

//   const isMatch = await bcrypt.compare(pass, hashedPassword);
//   console.log(isMatch);
// };

// hashGivenPassword(password);

//jwt
// const jwt = require("jsonwebtoken");

// const jwtTest = async () => {
//   const user = { _id: "12345" };
//   const secret = "thisismysecret";

//   const token = jwt.sign(user, secret, { expiresIn: "1 day" });

//   console.log(token);

//   const data = jwt.verify(token, secret);
//   console.log(data);
// };

// jwtTest();

// const Task = require("./models/task");
// const User = require("./models/user");

// const main = async () => {
//   // const task = await Task.findById("5fc0dcd796f5580d40a7d954");
//   // await task.populate("owner").execPopulate();
//   // console.log(task.owner);

//   const user = await User.findById("5fc0e243d1fc433920ca3426");
//   await user.populate("tasks").execPopulate();
//   console.log(user.tasks);
// };

// main();
