const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    liked: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [null],
    },
    dislike: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [null],
    },
    comment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("Comment", commentSchema);
