const express = require("express");
const router = express.Router();
const multer  = require('multer');
const path = require("path");
const imageController = require("../controllers/imageController");

router.get("/", async (req, res) => {
    res.render("index");
});


router.get("/portofoliu", imageController.getImages);



module.exports = router;
