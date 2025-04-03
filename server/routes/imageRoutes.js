require("dotenv").config();
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const Images = require("../../models/Images"); // ✅ Import the model
const { authMiddleware } = require("./admin"); // ✅ Import auth middleware

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Set up Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "portfolio_images", // Save images inside this folder on Cloudinary
        format: async (req, file) => "jpg", // Convert all images to JPG
        public_id: (req, file) => `${Date.now()}-${file.originalname}`
    }
});

const upload = multer({ storage: storage });
 
// ✅ Upload route
router.post("/profile-upload-multiple", authMiddleware, upload.array("profile-files", 12), async (req, res) => {
    try {
        const { service } = req.body; // Get service from the form
        
        if (!service) {
            return res.status(400).json({ message: "Service type is required!" });
        }

        console.log("Files uploaded:", req.files);
        console.log("Service:", service);

        const imageDocs = req.files.map(file => ({
            public_id: file.filename, // Store public_id from Cloudinary
            url: file.path,  // ✅ Store the correct Cloudinary URL
            filename: file.originalname,
            service: service
        }));
        
        await Images.insertMany(imageDocs); // ✅ Save in MongoDB

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).send("Error uploading images");
    }
});

module.exports = router;
