const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user-controller");
const auth = require("../middlewares/auth");

router.get("/", auth, UserController.getAll);
router.post("/create", UserController.createUser);
router.post("/authenticate", UserController.authenticate);
router.get("/me", auth, UserController.me);
module.exports = router;
