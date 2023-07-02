const Video = require("../model/Video");
const Report = require("../model/Report");
const fs = require("fs");
const path = require("path");
const { getId, videoImage } = require("../services/videoImage");
const { default: mongoose } = require("mongoose");
const User = require("../model/User");
const { arrayUpdate } = require("../services/utilities");
const { toggleLike } = require("../services/utilities");
const List = require("../model/List");

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
      if (req.body.list) {
        req.body.list = mongoose.Types.ObjectId(req.body.list);
      } else {
        delete req.body.list;
      }
      console.log(req.body);

      const listLength = async () => {
        if (req.body.list) {
          const listLengthR = await List.findById(req.body.list);
          return listLengthR.video.length + 1;
        } else {
          return 0;
        }
      };

      const videoCreation = await Video.create({
        ...req.body,
        author: req.userId,
        videoImage: videoImage(req.body.videoLink),
        order: await listLength(),
      });

      if (req.body.list) {
        await List.findByIdAndUpdate(req.body.list, {
          $push: { video: videoCreation._id },
        });
      }

      // await User.findByIdAndUpdate(req.userId, {
      //   $push: { myVideos: videoCreation._id },
      // });

      await User.findById(req.userId).then((doc) => {
        doc.myVideos.push(videoCreation._id);
        if (!doc.mainVideo) {
          doc.mainVideo = videoCreation._id;
        }
        return doc.save();
      });

      res.status(201).send("created successfully");
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ message: "required field error" });
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
  console.log("00000000000000000000000000000000000000000000000000000");

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

    if (req.body.like != null) {
      toggleLike(
        Video,
        User,
        "like",
        "dislike",
        req.userId,
        video._id,
        req.body.like
      );
      delete req.body.like;
    } else if (req.body.dislike != null) {
      toggleLike(
        Video,
        User,
        "dislike",
        "like",
        req.userId,
        video._id,
        req.body.dislike
      );
      delete req.body.dislike;
    } else {
      const updates = Object.keys(req.body);
      updates.forEach((update) => (video[update] = req.body[update]));
    }

    await video.save();

    res.send(video);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const deleteVideo = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Video ID required." });

  // const video = await Video.findByIdAndDelete(req.body.id);
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res
      .status(404)
      .json({ message: `No video matches ID ${req.params.id}.` });
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
    await Video.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(req.userId, {
      $pull: { myVideos: req.params.id },
    });

    if (video.list) {
      await List.findByIdAndUpdate(video.list, {
        $pull: { video: req.params.id },
      });
    }
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

//! add if condition and return
const getVideo = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Video ID required." });
  console.log(
    "$$$$$$$$$$$$$$$$$$$$$$$$$$",
    req.userId,
    "$$$$$$$$$$$$$$$$$$$$$$$$$$"
  );
  // const hasReport = await Report.find({
  //   author: req.userId,
  //   video: req.params.id,
  // });

  let mainProject = {
    _id: 1,
    title: 1,
    description: 1,
    dubbingLanguage: 1,
    videoLanguage: 1,
    category: 1,
    videoLink: 1,
    type: 1,
    startMinute: 1,
    startSecond: 1,
    endMinute: 1,
    endSecond: 1,
    notify: 1,
    views: { $size: "$views" },
    like: { $size: "$like" },
    dislike: { $size: "$dislike" },
    updatedAt: 1,
    videoImage: 1,
    tag: 1,
    path: 1,
    comments: 1,
    order: 1,
    reports: 1,
    "author.username": "$author.username",
    "author._id": "$author._id",
    "author.coffeeLink": "$author.coffeeLink",
    "author.avatar": "$author.avatar",
    "author.usersSubscribeCount": {
      $size: "$author.usersSubscribe",
    },

    remove: {
      $cond: [
        {
          $and: [
            { $eq: ["$author._id", req.userId] },
            { $ne: [req.userId, null] },
            { $ne: [req.userId, undefined] },
          ],
        },
        true,
        false,
      ],
    },
    watchLater: {
      $cond: [
        { $in: [mongoose.Types.ObjectId(req.params.id), "$author.watchLater"] },
        true,
        false,
      ],
    },
    isSubscribe: {
      $cond: [
        {
          $in: [req.userId, "$author.usersSubscribe"],
        },
        true,
        false,
      ],
    },
    // usersSubscribe: "$author.usersSubscribe",
    // userid: req.userId,
    // userid: "$author._id",

    lists: 1,
  };

  let commentProject = {
    _id: 1,
    commentOn: 1,
    type: 1,
    text: 1,
    updatedAt: 1,
    comments: 1,
    like: {
      $size: "$like",
    },
    dislike: {
      $size: "$dislike",
    },
    isLike: {
      $cond: [{ $in: [req.userId, "$like"] }, true, false],
    },
    isDislike: {
      $cond: [{ $in: [req.userId, "$dislike"] }, true, false],
    },
    "commentUser._id": 1,
    "commentUser.username": 1,
    "commentUser.avatar": 1,
  };

  if (req.userId) {
    mainProject = {
      ...mainProject,
      "author.isUsersSubscribe": {
        $cond: [{ $in: [req.userId, "$author.usersSubscribe"] }, true, false],
      },
      isLike: {
        $cond: [{ $in: [req.userId, "$like"] }, true, false],
      },
      isDislike: {
        $cond: [{ $in: [req.userId, "$dislike"] }, true, false],
      },
      // report: hasReport,
    };

    commentProject = {
      ...commentProject,
      isLike: {
        $cond: [{ $in: [req.userId, "$like"] }, true, false],
      },
      isDislike: {
        $cond: [{ $in: [req.userId, "$dislike"] }, true, false],
      },
    };
  }

  const videos = await Video.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },

    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $lookup: {
        from: "lists",
        localField: "list",
        foreignField: "_id",
        let: { listVid: "$list" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$listVid"],
              },
            },
          },

          {
            $lookup: {
              from: "videos",
              localField: "video",
              foreignField: "_id",
              as: "listVideo",
            },
          },
          {
            $addFields: {
              listVideo: {
                $map: {
                  input: "$listVideo",
                  as: "listVideo",
                  in: {
                    like: { $size: "$$listVideo.like" },
                    views: { $size: "$$listVideo.views" },
                    _id: "$$listVideo._id",
                    description: "$$listVideo.description",
                    title: "$$listVideo.title",
                    updatedAt: "$$listVideo.updatedAt",
                    videoImage: "$$listVideo.videoImage",
                    videoLink: "$$listVideo.videoLink",
                    order: "$$listVideo.order",
                  },
                },
              },
            },
          },
          {
            $project: {
              listVideo: 1,
              title: 1,
              description: 1,
            },
          },
        ],
        as: "lists",
      },
    },
    // {
    //   $unwind: "$lists",
    // },
    {
      $lookup: {
        from: "reports",
        let: { reports: "$reports" },
        pipeline: [
          {
            $match: {
              author: { $eq: req.userId ? req.userId.toString() : "" },
              video: { $eq: req.params.id },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],

        as: "reports",
      },
    },

    {
      $unwind: "$author",
    },
    {
      $lookup: {
        from: "comments",
        let: { commentsss: "$comments" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$commentsss"],
              },
            },
          },

          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "commentUser",
            },
          },
          {
            $unwind: "$commentUser",
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $project: commentProject,
          },
        ],
        as: "comments",
      },
    },

    {
      $project: mainProject,
    },
  ]);
  await Video.findByIdAndUpdate(req.params.id, {
    $push: { views: req.userId ? req.userId : "guest" },
  });

  res.json(videos);
};

const updateOrder = async (req, res) => {
  const updatePromises = req.body.map(async (item) => {
    try {
      const { _id, order } = item;
      await Video.findByIdAndUpdate(_id, { order });
      console.log(`Updated order for video with _id: ${_id}`);
    } catch (error) {
      console.error(`Error updating video with _id: ${_id}`, error);
    }
  });

  Promise.all(updatePromises)
    .then(() => {
      console.log("All videos updated successfully");
    })
    .catch((error) => {
      console.error("Error updating videos", error);
    });

  res.send("ok");
};

module.exports = {
  getAllVideos,
  createNewVideo,
  patchVideo,
  deleteVideo,
  getVideo,
  updateOrder,
};
