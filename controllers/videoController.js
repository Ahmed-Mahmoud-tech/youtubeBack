const Video = require("../model/Video");
const fs = require("fs");
const path = require("path");
const { videoImage } = require("../services/videoImage");

const getAllVideos = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  try {
    const videos = await Video.find()
      .select("title like dislike author videoLink")
      .populate({ path: "author", select: ["username", "avatar"] })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const responseVideos = [];
    for (let video of videos) {
      video._doc.image = videoImage(video.videoLink); // add greeting to user document
      responseVideos.push(video); // add modified user document to new array
    }
    res.send(responseVideos);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const createNewVideo = async (req, res) => {
  if (
    req.body.title &&
    req.body.description &&
    req.body.dubbingLanguage &&
    req.body.videoLanguage &&
    req.body.category &&
    req.body.videoLink &&
    req.body.type &&
    req.body.startMinute &&
    req.body.startSecond
  ) {
    try {
      await Video.create({
        ...req.body,
        author: req.userId,
        videoImage: videoImage(req.body.videoLink),
      });
      res.status(201).send("created successfully");
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ message: "required filed error" });
  }
};

// const putVideo = async (req, res) => {
//   try {
//     const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!video) {
//       return res.status(404).send();
//     }
//     res.send(video);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send();
//   }
// };

// PATCH /videos/:id

const patchVideo = async (req, res) => {
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
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).send();
    }

    updates.forEach((update) => (video[update] = req.body[update]));
    console.log({ body: req.body }, { updates }, { video });
    await video.save();

    res.send(video);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const deleteVideo = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "Video ID required." });

  // const video = await Video.findByIdAndDelete(req.body.id);
  const video = await Video.findById(req.body.id);

  if (!video) {
    return res
      .status(404)
      .json({ message: `No video matches ID ${req.body.id}.` });
  }

  if (req.userId !== video.author) {
    return res(403).json({ message: "sorry, you aren't the owner" });
  } else {
    // delete reports also
    await Report.deleteMany({ _id: { $in: video.report } });

    // delete all comments on this video
    const commentIds = [];
    const getAllCommentIds = async (comments) => {
      if (comments.length) {
        commentIds.push(...comments);
        for (const commentId of comments) {
          const newComments = await Comment.findById(commentId);
          await getAllCommentIds(newComments.comments);
        }
      }
    };
    await getAllCommentIds(video.comments);
    await Comment.deleteMany({ _id: { $in: commentIds } });
    // delete video itself
    await Video.findByIdAndDelete(req.body.id);
  }

  fs.unlink(path.join(__dirname, "../", video.path), (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log("File was successfully deleted.");
    }
  });
  res.send("removed");
};

const getVideo = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Video ID required." });
  const video = await Video.findOne({ _id: req.params.id })
    .populate({ path: "author", select: ["username", "avatar", "subscribe"] })
    .exec();

  if (!video) {
    return res
      .status(204)
      .json({ message: `No video matches ID ${req.params.id}.` });
  }
  video._doc.author._doc.subscribe = video._doc.author._doc.subscribe.length;
  video._doc.image = videoImage(video.videoLink);
  res.json(video);
};

module.exports = {
  getAllVideos,
  createNewVideo,
  patchVideo,
  deleteVideo,
  getVideo,
};
