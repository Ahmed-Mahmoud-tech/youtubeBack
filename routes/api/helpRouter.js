const express = require("express");
const router = express.Router();
const helpController = require("../../controllers/helpController");
const verifyJWT = require("../../middleware/verifyJWT");

router.route("/auth").post(verifyJWT, helpController.createNewHelp);
router
  .route("/:id")
  .get(verifyJWT, helpController.getHelp)
  .patch(verifyJWT, helpController.patchHelp)
  .delete(verifyJWT, helpController.deleteHelp);
router
  .route("/")
  .get(verifyJWT, helpController.getAllHelp)
  .post(helpController.createNewHelp);

module.exports = router;
