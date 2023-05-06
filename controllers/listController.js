const List = require("../model/List");
const User = require("../model/User");
const Video = require("../model/Video");

const getAllLists = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  try {
    const lists = await List.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    res.send(lists);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const getUserList = async (req, res) => {
  try {
    const list = await User.findById(req.userId)
      .select("list")
      .populate({
        path: "list",
        select: ["title"],
      });

    const listsTitle = {};
    for (let i = 0; i < list.list.length; i++) {
      listsTitle[list.list[i].title] = list.list[i]._id;
    }
    res.send(listsTitle);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const createNewList = async (req, res) => {
  if (req.body.title) {
    try {
      console.log("0", { ...req.body, author: req.userId });
      const newList = await List.create({
        ...req.body,
        author: req.userId,
      });
      console.log("5");
      await User.findByIdAndUpdate(req.userId, {
        $push: { list: newList._id },
      });
      console.log("10");

      res.status(201).send("created successfully");
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ message: "required field error" });
  }
};

const patchList = async (req, res) => {
  const updates = Object.keys(req.body);

  //! patch validation
  const allowedUpdates = ["video", "title"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      if (update === "video") {
        list.video = req.body.video.split(",");
      } else {
        list[update] = req.body[update];
      }
    });
    await list.save();

    res.send(list);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const deleteList = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "List ID required." });

  // const list = await List.findByIdAndDelete(req.body.id);
  const list = await List.findByIdAndDelete(req.params.id);
  await User.findByIdAndUpdate(req.userId, {
    $pull: { list: req.params.id },
  });

  if (!list) {
    return res
      .status(404)
      .json({ message: `No list matches ID ${req.params.id}.` });
  }

  Video.updateMany({ _id: { $in: list.video } }, { $set: { list: "" } });

  res.send("removed");
};

const getList = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "List ID required." });
  const list = await List.findById({ _id: req.params.id });
  const listPopulated = await list.populate({
    path: "video",
    select: ["title", "updatedAt", "videoLink"],
  });

  const firstVideo = await Video.findById(list.video[0]).exec();

  listPopulated._doc.firstVideo = firstVideo;

  if (!list) {
    return res
      .status(204)
      .json({ message: `No list matches ID ${req.params.id}.` });
  }
  res.json(listPopulated);
};

module.exports = {
  getAllLists,
  createNewList,
  patchList,
  deleteList,
  getList,
  getUserList,
};
