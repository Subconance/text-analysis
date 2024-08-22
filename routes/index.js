const express = require("express");
const {
  wordCount,
  tokenize,
  stem,
  posRoute,
  keywords,
  sentiment,
  ner,
} = require("../controllers");

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Text Analysis API",
  });
});

router.post("/word-count", wordCount);
router.post("/tokenize", tokenize);
router.post("/stem", stem);
router.post("/pos", posRoute);
router.post("/sentiment", sentiment);
router.post("/ner", ner);
router.post("/keywords", keywords);

module.exports = router;
