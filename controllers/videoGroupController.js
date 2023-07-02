const List = require("../model/List");
const User = require("../model/User");
const Video = require("../model/Video");

const mainSearch = async (req, res) => {
  const limit = Math.floor(parseInt(req.query.limit) / 3) || 10;
  const page = parseInt(req.query.page) || 1;
  if (!req?.params?.search)
    return res.status(400).json({ message: "List ID required." });
  let result = [];
  try {
    // Use a regular expression to match posts by a partial name

    const regex = new RegExp(req.params.search, "gi");
    console.log("$$", regex, "$$");
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
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
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
        $match: {
          // Specify the condition to exclude items
          "mainVideo.title": { $exists: true },
        },
      },
      {
        $project: {
          _id: "$mainVideo._id",
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
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
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
          _id: "$firstChild._id",
          title: 1,
          description: 1,
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
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

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

const usersAction = async (req, res) => {
  console.log(
    "here*******************************************************************usersAction******"
  );
  const action = req.params.action;
  console.log(action, "ddddddddddddd00");
  const page = parseInt(req.query.page) || 1;
  const limit = Math.floor(parseInt(req.query.limit) / 3) || 10;

  console.log({ action });
  const videos = await User.aggregate([
    { $match: { _id: req.userId } },

    {
      $lookup: {
        from: "videos",
        localField: `${action}`,
        foreignField: "_id",
        as: action,
      },
    },
    {
      $addFields: {
        actionVideo: {
          $map: {
            input: `$${action}`,
            as: "target",
            in: {
              like: { $size: `$$target.like` },
              views: { $size: `$$target.views` },
              _id: `$$target._id`,
              description: `$$target.description`,
              title: `$$target.title`,
              updatedAt: `$$target.updatedAt`,
              videoImage: `$$target.videoImage`,
              videoLink: `$$target.videoLink`,
              remove: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ["$_id", req.userId],
                      },
                      { $ne: [req.userId, null] },
                      { $ne: [req.userId, undefined] },
                    ],
                  },
                  true,
                  false,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        actionVideo: 1,
        username: 1,
        avatar: 1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);
  console.log(videos[0].actionVideo, "00000");

  const data = [];
  videos[0].actionVideo.map((item) => {
    item.username = videos[0].username;
    item.avatar = videos[0].avatar;
    data.push(item);
  });
  res.json(data);
};

const usersSubscribe = async (req, res) => {
  console.log(
    "here*******************************************************************usersSubscribe******"
  );
  const action = req.params.action;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.floor(parseInt(req.query.limit) / 3) || 10;

  const videos = await User.aggregate([
    { $match: { _id: req.userId } },

    {
      $lookup: {
        from: "users",
        localField: `subscribe`,
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: `mainVideo`,
              foreignField: "_id",
              as: "userMainVideo",
            },
          },
          {
            $addFields: {
              userMainVideo: { $arrayElemAt: ["$userMainVideo", 0] },
            },
          },
          {
            $project: {
              username: 1,
              avatar: 1,
              videoImage: "$userMainVideo.videoImage",
              _id: "$userMainVideo._id",
              videoLink: "$userMainVideo.videoLink",
              title: "$userMainVideo.title",
              description: "$userMainVideo.description",
              updatedAt: "$userMainVideo.updatedAt",
              like: { $size: "$userMainVideo.like" },
              views: { $size: "$userMainVideo.views" },
              videoLength: "0",
            },
          },
        ],
        as: "subscribed",
      },
    },
    {
      $project: {
        subscribed: "$subscribed",
      },
    },

    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  res.json(videos[0].subscribed);
};

const usersList = async (req, res) => {
  console.log(
    "here*******************************************************************usersList******"
  );
  const page = parseInt(req.query.page) || 1;
  const limit = Math.floor(parseInt(req.query.limit) / 3) || 10;

  const videos = await User.aggregate([
    { $match: { _id: req.userId } },

    {
      $lookup: {
        from: "lists",
        localField: "list",
        foreignField: "_id",
        let: { theListTitle: "$title" },
        pipeline: [
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
              videoLength: { $size: "$listVideo" },
              firstElement: { $arrayElemAt: ["$listVideo", 0] },
              theListTitle: "$theListTitle",
            },
          },
          {
            $project: {
              videoImage: "$firstElement.videoImage",
              _id: "$firstElement._id",
              videoLink: "$firstElement.videoLink",
              title: 1,
              description: 1,
              videoLength: 1,
            },
          },
        ],
        as: "lists",
      },
    },
    {
      $project: {
        username: 1,
        theList: 1,
        avatar: 1,
        lists: 1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  const data = [];
  videos[0].lists.map((item) => {
    item.username = videos[0].username;
    item.avatar = videos[0].avatar;
    if (item.videoLength > 0) {
      data.push(item);
    }
  });
  res.json(data);
};

module.exports = {
  usersAction,
  mainSearch,
  usersList,
  usersSubscribe,
};
