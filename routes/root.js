const express = require("express");
const router = express.Router();

// router accept regex
router.get("/", (req, res) => {
  res.json({ data1: "data1" });
});

module.exports = router;
