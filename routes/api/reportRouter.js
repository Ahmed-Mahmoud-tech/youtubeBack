const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/reportController");
const verifyJWT = require("../../middleware/verifyJWT");

router
  .route("/")
  .post(reportController.createNewReport)
  // .get(reportController.getAllReports)
  .delete(reportController.deleteReport);

router.route("/:id").get(reportController.getReport).patch(
  verifyJWT,
  // verifyRoles(ROLES_LIST.User),
  reportController.patchReport
);

module.exports = router;
