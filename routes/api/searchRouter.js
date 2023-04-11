const express = require("express");
const router = express.Router();
const searchController = require("../../controllers/searchController");
const verifyJWT = require("../../middleware/verifyJWT");

router.route("/auth/:search").get(verifyJWT, searchController.mainSearch);
router.route("/:search").get(searchController.mainSearch);
module.exports = router;
