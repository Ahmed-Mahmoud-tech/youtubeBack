const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    commentOn: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: String,
      enum: ["video", "comment"],
      default: "video",
      message: "{VALUE} is not a valid comment",
    },
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    like: {
      type: [mongoose.Schema.Types.ObjectId],
      default: null,
      unique: true,
    },
    dislike: {
      type: [mongoose.Schema.Types.ObjectId],
      default: null,
      unique: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("Comment", commentSchema);
