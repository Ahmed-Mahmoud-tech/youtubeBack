const express = require("express");
const { createFile } = require("../../services/createFile");
const router = express.Router();
const videoController = require("../../controllers/videoController");
const verifyJWT = require("../../middleware/verifyJWT");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .post(
    verifyJWT,
    // verifyRoles(ROLES_LIST.User),
    createFile("uploads/audio", ".mp3", "blob"),
    videoController.createNewVideo
  )
  .get(videoController.getAllVideos)
  .delete(
    verifyJWT,
    //verifyRoles(ROLES_LIST.User),
    videoController.deleteVideo
  );

router.route("/:id").get(videoController.getVideo).patch(
  verifyJWT,
  // verifyRoles(ROLES_LIST.User),
  videoController.patchVideo
);

module.exports = router;
