const express = require("express");
const router = express.Router();
const IncomesController = require("../controllers/incomes-controller");
const auth = require("../middlewares/auth");

router.post("/create", auth, IncomesController.createIncome);
router.get("/list", auth, IncomesController.getIncomesByUser);

module.exports = router;
