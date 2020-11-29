const express = require("express");
const Task = require("../models/task");
const authMiddleware = require("../middleware/auth");

const router = new express.Router();

router.post("/tasks", authMiddleware, async (req, res) => {
  // const task = new Task(req.body);

  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(200).send(task);
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

//GET tasks?completed=true
//GET tasks?limit=2&skip=1
//GET tasks?Orderyby=createdAt:asc (1= asc, -1 = desc) its a build in option. : colon describes a special character in the query string
//{{domain}}/tasks?orderBy=createdAt:asc
router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    // // const tasks = await Task.find({});
    // const owner = req.user._id;
    // //one way to get tasks
    // const tasks1 = await Task.find({ owner: req.user._id });

    //another way to get tasks.
    // await req.user.populate("tasks").execPopulate();

    //implemenation for query parameters, pagination
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    if (req.query.orderBy) {
      const parts = req.query.orderBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    console.log("sort parts ", sort);
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();

    // console.log("Current User ", req.user);
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(404).send({ message: e.message });
  }
});

router.get("/tasks/:id", authMiddleware, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send({ message: "Task not found." });
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send({ message: e });
  }
});

router.patch("/tasks/:id", authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send("Invalid update.");
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    console.log("Task to be updated ", task);
    if (!task) {
      res.status(404).send;
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.status(201).send(task);
  } catch (e) {
    res.send(e);
  }
});

router.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(401).send("task not found");
    }
    res.send(task);
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
