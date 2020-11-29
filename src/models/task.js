const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
      minLength: 4,
      validate(value) {
        if (value.length < 4) {
          throw new Error("Description must be more than 4 letters.");
        }
      },
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.pre("save", async function (next) {
  const task = this;
  console.log("just before saving task.");
  next();
});
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
