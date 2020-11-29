const mongoose = require("mongoose");
const validator = require("validator");
const databaseName = "task-manager-Api";

const url = process.env.DBURL;

mongoose.connect(url + databaseName, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
