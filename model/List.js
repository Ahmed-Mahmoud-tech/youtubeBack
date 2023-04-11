const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    video: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Video",
      default: [],
      unique: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("List", listSchema);
