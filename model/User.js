const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Editor: Number,
    Admin: Number,
  },
  avatar: {
    type: String,
    default:
      "https://cdn.xxl.thumbs.canstockphoto.com/businessman-profile-avatar-vector-illustration-graphic-design-illustration_csp67735820.jpg",
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    message: "{VALUE} is not a valid gender",
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  usersSubscribe: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  mainVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
  like: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Video",
    default: [],
  },
  myVideos: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Video",
    default: [],
  },
  dislike: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Video",
    default: [],
  },
  subscribe: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  watchLater: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Video",
    default: [],
  },
  coffee: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Coffee",
    default: [],
  },
  coffeeLink: {
    type: String,
    default: "https://ko-fi.com/langtupe",
  },
  notification: {
    type: Array,
    default: [],
  },
  list: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "List",
    default: [],
  },
  report: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Report",
    default: [],
  },
  support: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  supportIframe: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
