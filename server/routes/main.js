const express = require("express");
const router = express.Router();
const multer  = require('multer');
const path = require("path");
const imageController = require("../controllers/imageController");

router.get("/", async (req, res) => {
    res.render("index");
});

// Render portfolio with uploaded images
// router.get("/portofoliu", async (req, res) => {
//     res.render("portofolio");
// });

router.get("/portofoliu", imageController.getImages);
module.exports = router;
