const express = require("express");
const { createFile } = require("../../services/createFile");
const router = express.Router();
const videoController = require("../../controllers/videoController");
const verifyJWT = require("../../middleware/verifyJWT");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router.route("/order").patch(verifyJWT, videoController.updateOrder);

router
  .route("/")
  .post(
    verifyJWT,
    // verifyRoles(ROLES_LIST.User),
    createFile("uploads/audio", "audio", ".mp3", "blob", "path"),
    videoController.createNewVideo
  )
  .get(videoController.getAllVideos);

router
  .route("/:id")
  .get(videoController.getVideo)
  .patch(
    verifyJWT,
    // verifyRoles(ROLES_LIST.User),
    videoController.patchVideo
  )
  .delete(
    verifyJWT,
    //verifyRoles(ROLES_LIST.User),
    videoController.deleteVideo
  );

router.route("/auth/:id").get(verifyJWT, videoController.getVideo);

module.exports = router;
