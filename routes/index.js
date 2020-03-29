const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  return res.send({
    message: "Welcome to KUANZ API, you must be authenticated to use this API!"
  });
});

router.post("/", (req, res) => {
  return res.send({ message: "tudo ok" });
});

module.exports = router;
