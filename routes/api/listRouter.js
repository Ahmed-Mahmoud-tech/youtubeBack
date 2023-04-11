const express = require("express");
const router = express.Router();
const listController = require("../../controllers/listController");
const verifyJWT = require("../../middleware/verifyJWT");

router
  .route("/")
  .post(verifyJWT, listController.createNewList)
  .get(listController.getAllLists);

router
  .route("/:id")
  .get(listController.getList)
  .patch(verifyJWT, listController.patchList)
  .delete(verifyJWT, listController.deleteList);

module.exports = router;
