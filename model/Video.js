const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// ##################### select field from get all for video

const videoSchema = new Schema(
  {
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
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
    videoImage: {
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
      type: Array,
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    like: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    dislike: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    coffee: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    report: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Report",
      default: [],
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("Video", videoSchema);
