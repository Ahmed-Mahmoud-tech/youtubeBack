const Help = require("../model/Help");

const getAllHelp = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  try {
    const help = await Help.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    res.send(help);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const createNewHelp = async (req, res) => {
  if (req.body.title) {
    try {
      const newHelp = await Help.create({
        ...req.body,
        author: req.userId ? req.userId : null,
      });

      res.status(201).send("created successfully");
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ message: "required field error" });
  }
};

const patchHelp = async (req, res) => {
  const updates = Object.keys(req.body);
  //! patch validation
  const allowedUpdates = ["status"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const help = await Help.findById(req.params.id);
    if (!help) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      help[update] = req.body[update];
    });
    await help.save();

    res.send(help);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const deleteHelp = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Help ID required." });

  // const help = await Help.findByIdAndDelete(req.body.id);
  const help = await Help.findByIdAndDelete(req.params.id);
  if (!help) {
    return res
      .status(404)
      .json({ message: `No help matches ID ${req.params.id}.` });
  }
  res.send("removed");
};

const getHelp = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Help ID required." });
  const help = await Help.findById({ _id: req.params.id });

  if (!help) {
    return res
      .status(204)
      .json({ message: `No help matches ID ${req.params.id}.` });
  }
  res.json(help);
};

module.exports = {
  getAllHelp,
  createNewHelp,
  patchHelp,
  deleteHelp,
  getHelp,
};
