const Coffee = require("../model/Coffee");
const Video = require("../model/Video");
const User = require("../model/User");
// when create coffee add id to user or video and when delete remove
// test api on postman

//! update video service

const getAllCoffees = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  try {
    const coffees = await Coffee.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    res.send(coffees);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const createNewCoffee = async (req, res) => {
  if (req.body.to && req.body.on) {
    try {
      const newCoffee = await Coffee.create({
        ...req.body,
        from: req.userId,
      });

      await Video.findByIdAndUpdate(req.body.on, {
        $push: { coffee: newCoffee._id },
      });
      await User.findByIdAndUpdate(req.body.to, {
        $push: { coffee: newCoffee._id },
      });

      res.status(201).send("created successfully");
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ message: "required filed error" });
  }
};

const getCoffeeForVideo = async (req, res) => {
  // video id ===> req.params.id

  if (!req?.params?.id)
    return res.status(400).json({ message: "Coffee ID required." });

  const video = await Video.findOne({ _id: req.params.id }).exec();

  if (!video) {
    return res
      .status(204)
      .json({ message: `No video matches ID ${req.params.id}.` });
  }

  // const coffee = await Coffee.find(
  //   { _id: { $in: video.coffee } },
  //   (err, coffee) => {
  //     if (err) {
  //       console.error(err);
  //     } else {
  //       console.log(coffee); // Array of user objects corresponding to the IDs
  //     }
  //   }
  // );

  res.json("coffee");
};

module.exports = {
  getAllCoffees,
  createNewCoffee,
  getCoffeeForVideo,
};
