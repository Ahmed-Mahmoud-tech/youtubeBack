const express = require("express");
const router = express.Router();
const videoGroupController = require("../../controllers/videoGroupController");
const verifyJWT = require("../../middleware/verifyJWT");

router.route("/auth/:search").get(verifyJWT, videoGroupController.mainSearch);
router
  .route("/users_action/:action")
  .get(verifyJWT, videoGroupController.usersAction);
router.route("/subscribe").get(verifyJWT, videoGroupController.usersSubscribe);
router.route("/users_list").get(verifyJWT, videoGroupController.usersList);
router.route("/:search").get(videoGroupController.mainSearch);
module.exports = router;
