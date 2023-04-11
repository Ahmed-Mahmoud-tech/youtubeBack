const express = require("express");
const router = express.Router();
const commentController = require("../../controllers/commentController");
const verifyJWT = require("../../middleware/verifyJWT");

router.route("/").post(
  verifyJWT,
  // verifyRoles(ROLES_LIST.User),
  commentController.createNewComment
);
router.route("/notAuth/:type/:id").get(commentController.UnAuthGetComment);

router
  .route("/:id")
  .patch(verifyJWT, commentController.patchComment)
  .delete(verifyJWT, commentController.deleteComment);

router.route("/:type/:id").get(verifyJWT, commentController.getComment);

module.exports = router;
