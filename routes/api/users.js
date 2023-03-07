const express = require("express");
const { createFile } = require("../../services/createFile");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(verifyRoles(ROLES_LIST.User), usersController.getAllUsers)
  .delete(verifyRoles(ROLES_LIST.User), usersController.deleteUser);

router
  .route("/:id")
  .patch(
    verifyRoles(ROLES_LIST.User),
    createFile(createFile("uploads/avatar", ".jpeg", "avatar")),
    usersController.patchUser
  )
  .get(verifyRoles(ROLES_LIST.User), usersController.getUser);

module.exports = router;
