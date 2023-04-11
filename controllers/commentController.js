const Comment = require("../model/Comment");
const Video = require("../model/Video");

const createNewComment = async (req, res) => {
  if (req.body.text) {
    try {
      const newComment = await Comment.create({
        ...req.body,
        author: req.userId,
      });
      const model = req.body.type == "video" ? Video : Comment;
      await model.findByIdAndUpdate(req.body.commentOn, {
        $push: { comments: newComment._id },
      });
      res.status(201).send("created successfully");
    } catch (err) {
      console.error(err);
    }
  } else {
    return res.status(400).json({ message: "required filed error" });
  }
};

const patchComment = async (req, res) => {
  // const updates = Object.keys(req.body);

  //! patch validation
  // const allowedUpdates = ["name", "email", "password"];
  // const isValidOperation = updates.every((update) =>
  //   allowedUpdates.includes(update)
  // );

  // if (!isValidOperation) {
  //   return res.status(400).send({ error: "Invalid updates!" });
  // }

  const toggleLike = async (Model, filed, userId, updatedModel, value) => {
    Model.findByIdAndUpdate(updatedModel, {
      [value]: { [filed]: userId },
    }).exec();
  };

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).send();
    }

    if (req.body.text != null) {
      comment.text = req.body.text;
      Comment.findByIdAndUpdate(comment._id, { text: req.body.text }).exec();
    }

    if (req.body.like != null) {
      toggleLike(Comment, "like", req.userId, comment._id, req.body.like);
    }

    if (req.body.dislike != null) {
      toggleLike(Comment, "dislike", req.userId, comment._id, req.body.dislike);
    }

    res.send(comment);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const deleteComment = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Comment ID required." });

  const removedComment = await Comment.findById(req.params.id);

  if (!removedComment) {
    return res
      .status(404)
      .json({ message: `No comment matches ID ${req.body.id}.` });
  }

  // remove comment id from parent
  const model = removedComment.type == "video" ? Video : Comment;
  await model.findByIdAndUpdate(removedComment.commentOn, {
    $pull: { comments: removedComment._id },
  });

  // check authorization
  if (req.userId.toString() !== removedComment.author.toString()) {
    return res.status(403).json({ message: "sorry, you aren't the owner" });
  }

  /* start for remove each comment on this comment */
  const commentIds = [removedComment._id];
  const getAllCommentIds = async (comments) => {
    if (comments.length) {
      commentIds.push(...comments);
      for (const commentId of comments) {
        const newComments = await Comment.findById(commentId);
        await getAllCommentIds(newComments.comments);
      }
    }
  };
  await getAllCommentIds(removedComment.comments);
  await Comment.deleteMany({ _id: { $in: commentIds } });
  /* end for remove each comment on this comment */

  res.send("removed");
};

const UnAuthGetComment = async (req, res) => {
  if (!req?.params?.id || !["video", "comment"].includes(req?.params?.type))
    return res.status(400).json({ message: "Comment ID required." });

  const Model =
    req.params.type === "video"
      ? Video
      : req.params.type === "comment"
      ? Comment
      : null;

  const comment = await Model.findById({ _id: req.params.id })
    .populate({ path: "comments", select: ["text"] })
    .exec();
  res.json(comment.comments);
};

const getComment = async (req, res) => {
  if (!req?.params?.id || !["video", "comment"].includes(req?.params?.type))
    return res.status(400).json({ message: "Comment ID required." });

  const Model =
    req.params.type === "video"
      ? Video
      : req.params.type === "comment"
      ? Comment
      : null;

  const comment = await Model.findById({ _id: req.params.id })
    .populate({ path: "comments", select: ["like", "dislike", "text"] })
    .exec();

  const result = [];
  for (singleComment of comment.comments) {
    const commentInfo = {};
    if (singleComment.like.includes(req.userId)) {
      commentInfo.userLike = true;
    } else {
      commentInfo.userLike = false;
    }
    if (singleComment.dislike.includes(req.userId)) {
      commentInfo.userDislike = true;
    } else {
      commentInfo.userDislike = false;
    }
    commentInfo.text = singleComment.text;
    result.push(commentInfo);
  }
  res.json(result);
};

module.exports = {
  createNewComment,
  patchComment,
  deleteComment,
  getComment,
  UnAuthGetComment,
};
