const express = require("express");
const router = express.Router();
const TagsController = require("../controllers/tags-controller");
const auth = require("../middlewares/auth");

router.post("/create", auth, TagsController.createTag);
router.get("/list", auth, TagsController.getTag);
router.delete("/delete", auth, TagsController.deleteTag);
router.post("/createDefaultTags", auth, TagsController.createDefaultTags);

module.exports = router;
