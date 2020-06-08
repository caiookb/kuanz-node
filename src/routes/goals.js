const express = require("express");
const router = express.Router();
const GoalsController = require("../controllers/goals-controller");
const auth = require("../middlewares/auth");

router.post("/create", auth, GoalsController.createGoal);
router.get("/list", auth, GoalsController.getGoalsByUser);
router.get("/list/:_id", auth, GoalsController.getGoalById);
router.delete("/delete", auth, GoalsController.deleteGoalsById);
router.put("/update", auth, GoalsController.updateGoalById);
router.put("/done", auth, GoalsController.getGoalDone);

module.exports = router;
