const List = require("../model/List");
const User = require("../model/User");
const Video = require("../model/Video");

const userSearchLimit = 3;
const mainSearch = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  if (!req?.params?.search)
    return res.status(400).json({ message: "List ID required." });
  let result = [];
  try {
    // Use a regular expression to match posts by a partial name

    const regex = new RegExp(req.params.search, "gi");
    const videos = await Video.aggregate([
      {
        $match: {
          $or: [
            {
              title: {
                $regex: regex,
              },
            },
            {
              description: {
                $regex: regex,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      // {
      //   $unwind: "$author",
      // },
      // {
      //   $addFields: {
      //     authorName: "$author.username",
      //     authorEmail: "$author.avatar",
      //   },
      // },
      {
        $project: {
          _id: 1,
          // authorName: 1,
          // authorEmail: 1,
          title: 1,
          description: 1,
          // bodyLength: { $strLenCP: "$body" },
          like: { $size: "$like" },
          views: { $size: "$views" },
          videoImage: 1,
          videoLink: 1,
          updatedAt: 1,
          username: { $arrayElemAt: ["$author.username", 0] },
          remove: {
            $cond: [
              {
                $and: [
                  { $eq: [{ $arrayElemAt: ["$author._id", 0] }, req.userId] },
                  { $ne: [req.userId, null] },
                  { $ne: [req.userId, undefined] },
                ],
              },
              true,
              false,
            ],
          },

          avatar: { $arrayElemAt: ["$author.avatar", 0] },
          // "author.username": 1,
          SearchType: "video",
        },
      },
      {
        $skip: (page - 1) * userSearchLimit,
      },
      {
        $limit: userSearchLimit,
      },
    ]);

    // console.log(".00000000000", videos, "videos");

    // const videos = await Video.find({
    //   $or: [{ title: regex }, { description: regex }],
    // })
    //   .select("title like views videoImage videoLink updatedAt author")
    //   .populate({ path: "author", select: ["username", "avatar"] })
    //   .skip((page - 1) * limit)
    //   .limit(limit)
    //   .exec();

    // const users = await User.find({
    //   $or: [{ username: regex }],
    // })
    //   .select("username avatar")
    //   .populate({
    //     path: "mainVideo",
    //     select: [
    //       "title ",
    //       "like ",
    //       "views ",
    //       "videoImage ",
    //       "videoLink ",
    //       "updatedAt",
    //     ],
    //   })
    //   .skip((page - 1) * userSearchLimit)
    //   .limit(userSearchLimit)
    //   .exec();

    const users = await User.aggregate([
      {
        $match: {
          username: {
            $regex: regex,
          },
        },
      },

      {
        $lookup: {
          from: "videos",
          localField: "mainVideo",
          foreignField: "_id",
          as: "video",
        },
      },

      {
        $addFields: {
          mainVideo: { $arrayElemAt: ["$video", 0] },
        },
      },
      {
        $project: {
          _id: "$mainVideo._id",
          X: "$_id",
          avatar: 1,
          username: 1,
          remove: {
            $cond: [
              {
                $and: [
                  { $eq: ["$_id", req.userId] },
                  { $ne: [req.userId, null] },
                  { $ne: [req.userId, undefined] },
                ],
              },
              true,
              false,
            ],
            // $cond: [{ $eq: ["$_id", req.userId] }, true, false],
          },
          title: "$mainVideo.title",
          description: "$mainVideo.description",
          like: { $size: "$mainVideo.like" },
          views: { $size: "$mainVideo.views" },
          videoImage: "$mainVideo.videoImage",
          videoLink: "$mainVideo.videoLink",
          updatedAt: "$mainVideo.updatedAt",
          SearchType: "user",
        },
      },
    ]);

    //!

    const lists = await List.aggregate([
      {
        $match: {
          title: {
            $regex: regex,
          },
        },
      },

      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },

      {
        $addFields: {
          firstChild: { $arrayElemAt: ["$video", 0] },
          author: { $arrayElemAt: ["$author", 0] },
          videoLength: { $size: "$video" },
          like: { $size: "$video.like" },
        },
      },
      {
        $project: {
          id: "$firstChild._id",
          title: 1,
          description: "$firstChild.description",
          like: { $size: "$firstChild.like" },
          views: { $size: "$firstChild.views" },
          videoImage: "$firstChild.videoImage",
          videoLink: "$firstChild.videoLink",
          updatedAt: "$firstChild.updatedAt",
          username: "$author.username",

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

          avatar: "$author.avatar",
          SearchType: "list",
          videoLength: 1,
        },
      },
    ]);

    console.log(req.userId, "ddddd");
    // ...aggregateArray,

    //!

    // const lists = await List.find({ title: regex }).exec();

    // const firstVideoIds = [];
    // const videoLength = [];
    // const videoTitles = [];
    // lists.map(async (list) => {
    //   firstVideoIds.push(list.video[0]);
    //   videoLength.push(list.video.length);
    //   videoTitles.push(list.title);
    // });

    // const firstVideoIdsData = await Video.aggregate([
    //   {
    //     $match: { _id: { $in: firstVideoIds } },
    //   },
    //   ...aggregateArray,
    //   {
    //     $addFields: {
    //       listLength: videoLength[index],
    //       // authorEmail: "$author.avatar",
    //     },
    //   },
    // ]);

    // firstVideoIdsData.map(async (Video, index) => {
    //   Video._doc.listLength = videoLength[index];
    //   Video._doc.title = videoTitles[index];
    // });

    result = [...users, ...videos, ...lists];
    // result = [...users, ...videos, ...firstVideoIdsData];
    // console.log({ users }, { videos }, { lists });
  } catch (error) {
    console.error(error);
  }

  res.json(result);
};

module.exports = {
  mainSearch,
};
