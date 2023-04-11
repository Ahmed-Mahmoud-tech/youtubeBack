const List = require("../model/List");
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

const createNewList = async (req, res) => {
  if (req.body.title) {
    try {
      await List.create({
        ...req.body,
        author: req.userId,
      });

      res.status(201).send("created successfully");
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ message: "required filed error" });
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

  if (!list) {
    return res
      .status(404)
      .json({ message: `No list matches ID ${req.params.id}.` });
  }

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
};
