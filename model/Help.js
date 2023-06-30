const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const helpSchema = new Schema(
  {
    author: {
      type: [mongoose.Schema.Types.ObjectId, null],
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["read", "unRead", "archive"],
      default: "unRead",
      message: "{VALUE} is not a valid",
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("Help", helpSchema);
