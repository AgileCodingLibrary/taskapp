const express = require("express");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");

const sharp = require("sharp");

const multer = require("multer");
const upload = multer({
  // dest: "avatars",  // remove this property so file can accessed in the handler.
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    // if (!file.originalname.endsWith(".pdf")) {
    //   callback(new Error("Please upload PDF file."));
    // }
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      callback(new Error("Allowed uploaded are jpeg, jpg or png."));
    }
    callback(undefined, true);
  },
});

const router = new express.Router();

router.get("/users/me", authMiddleware, async (req, res) => {
  res.send(req.user);
});

// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).send({ message: "User not found." });
//     }
//     res.status(200).send(user);
//   } catch (e) {
//     res.status(500).send({ message: e.message });
//   }
// });

router.post("/users", async (req, res) => {
  const newUser = new User(req.body);
  try {
    const token = await newUser.generateJWTtoken();
    await newUser.save();
    newUser.tokens = newUser.tokens.concat({ token });
    res.status(201).send({ user: newUser, token });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

router.patch("/users/me", authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send("Invalid update.");
  }

  try {
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    user.save();
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    if (!user) {
      res.status(404).send;
    }
    res.status(201).send(user);
  } catch (e) {
    res.send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.FindByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateJWTtoken();
    user.tokens = user.tokens.concat({ token });
    await user.save();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post("/users/logout", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send({ Error: e.message });
  }
});

router.post("/users/logoutAll", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send({ Error: e.message });
  }
});

router.delete("/users/me", authMiddleware, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);

    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(401).send(e);
  }
});

// router.post(
//   "/users/profile",
//   upload.single("uploadingFile"),
//   async (req, res) => {
//     try {
//       console.log("file uploaded..");
//       res.send();
//     } catch (e) {
//       res.send({ Error: e.message });
//     }
//   }
// );

//POST /users/me/avatar
router.post(
  "/users/me/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();

      req.user.avatar = buffer;

      // req.user.avatar = req.file.buffer; // file object is now part of the request as we have commit out the des property in the upload object.

      await req.user.save();
      res.send();
    } catch (e) {
      res.status(500).send({ Error: e.message });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ Error: error.message });
  }
);

//DELETE /users/me/avatar logged in user avatar be deleted.
router.delete("/users/me/avatar", authMiddleware, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    console.log(req.user);
    res.send({ message: "Avatar has been deleted." });
  } catch (e) {
    res.send({ Error: e.message });
  }
});

//Send avatar as a link
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error("Avatar not found.");
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.send({ Error: e.message });
  }
});
module.exports = router;
