const express = require("express");
const router = express.Router();
const SpendingsController = require("../controllers/spending-controller");
const auth = require("../middlewares/auth");

router.post("/create", auth, SpendingsController.createSpending);
router.get("/list", auth, SpendingsController.getSpendingsByUser);
router.get("/list/:_id", auth, SpendingsController.getSpendingById);
router.delete("/delete", auth, SpendingsController.deleteSpendingById);
router.put("/update", auth, SpendingsController.updateSpendingById);

module.exports = router;
