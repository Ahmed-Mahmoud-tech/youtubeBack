const { default: mongoose } = require("mongoose");
const User = require("../model/User");
const bcrypt = require("bcrypt");

// const { mailFun } = require("../services/sendEmail");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

const deleteUser = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.body.id} not found` });
  }
  const result = await user.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getUser = async (req, res) => {
  const userId = req.userId || req.params?.id;
  console.log({ userId });
  if (!userId) return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: userId })
    .select(
      "username roles avatar fullName age email phone mainVideo gender notification"
    )
    .exec();
  if (!user) {
    return res.status(204).json({ message: `User ID ${userId} not found` });
  }

  user._doc.roles = Object.keys(user.roles);
  res.json(user);
};

const patchUser = async (req, res) => {
  if (req.body.support) {
    await User.findByIdAndUpdate(req.params.id, {
      $push: { support: req.userId },
    });
    delete req.body.support;
    res.sendStatus(200);
  } else if (req.body.coffee) {
    await User.findByIdAndUpdate(req.params.id, {
      $push: { coffee: req.userId },
    });
    delete req.body.coffee;
    res.sendStatus(200);
  } else if (req.body.watchLater) {
    let updatedObject;
    if (req.body.watchLater.method == "add") {
      updatedObject = {
        $push: { watchLater: mongoose.Types.ObjectId(req.body.watchLater.id) },
      };
    } else if (req.body.watchLater.method == "remove") {
      updatedObject = {
        $pull: { watchLater: mongoose.Types.ObjectId(req.body.watchLater.id) },
      };
    }
    await User.findByIdAndUpdate(req.userId, updatedObject);
    delete req.body.watchLater;

    res.sendStatus(200);
  } else if (req.body.isSubscribe) {
    let subscribeUpdate;
    let usersSubscribeUpdate;
    if (req.body.isSubscribe.status == true) {
      subscribeUpdate = {
        $push: {
          subscribe: mongoose.Types.ObjectId(req.body.isSubscribe.videoAuthor),
        },
      };
      usersSubscribeUpdate = {
        $push: { usersSubscribe: req.userId },
      };
    } else if (req.body.isSubscribe.status == false) {
      subscribeUpdate = {
        $pull: {
          subscribe: mongoose.Types.ObjectId(req.body.isSubscribe.videoAuthor),
        },
      };
      usersSubscribeUpdate = {
        $pull: { usersSubscribe: req.userId },
      };
    }
    await User.findByIdAndUpdate(req.userId, subscribeUpdate);
    await User.findByIdAndUpdate(
      mongoose.Types.ObjectId(req.body.isSubscribe.videoAuthor),
      usersSubscribeUpdate
    );
    delete req.body.isSubscribe;

    res.sendStatus(200);
  } else {
    if (!req.body.avatar) {
      delete req.body.avatar;
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else {
      delete req.body.password;
    }
    if (req.body.notification) {
      req.body.notification = req.body.notification.split(",");
    }

    const updates = Object.keys(req.body);
    //! patch validation
    // const allowedUpdates = ["name", "email", "password"];
    // const isValidOperation = updates.every((update) =>
    //   allowedUpdates.includes(update)
    // );

    // if (!isValidOperation) {
    //   return res.status(400).send({ error: "Invalid updates!" });
    // }

    try {
      const user = await User.findById(req.params?.id);
      if (!user) {
        return res.status(404).send();
      }

      updates.forEach((update) => {
        user[update] = req.body[update];
      });

      console.log(req.body);
      await user.save();

      res.status(201).send();
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
};
module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
  patchUser,
};
