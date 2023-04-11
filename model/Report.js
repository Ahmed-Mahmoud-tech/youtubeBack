const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    reason: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
    },
    author: {
      type: String,
      ref: "User",
      required: true,
    },
    video: {
      type: String,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("Report", reportSchema);
