const express = require("express");
const router = express.Router();
const coffeeController = require("../../controllers/coffeeController");

router.route("/").post(coffeeController.createNewCoffee);
// .get(coffeeController.getAllCoffees)

router.route("/:id").get(coffeeController.getCoffeeForVideo);

module.exports = router;
