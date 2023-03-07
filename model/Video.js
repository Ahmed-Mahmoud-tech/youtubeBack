const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dubbingLanguage: {
      type: String,
      required: true,
    },
    videoLanguage: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    videoLink: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    startMinute: {
      type: String,
      required: false,
    },
    startSecond: {
      type: String,
      required: true,
    },
    endMinute: {
      type: String,
    },
    endSecond: {
      type: String,
    },
    list: [
      {
        type: String,
      },
    ],
    notify: {
      type: String,
    },
    tag: [
      {
        type: String,
      },
    ],
    path: {
      type: String,
    },
    views: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    like: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },

    dislike: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
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

module.exports = mongoose.model("Video", videoSchema);
