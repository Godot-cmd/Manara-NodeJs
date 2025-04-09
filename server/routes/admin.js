const express = require("express");
const router = express.Router();
const User = require("../models/User");
const adminLayout = '../views/layouts/admin';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const Images = require("../models/Images");
const cloudinary = require('cloudinary').v2;
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const checkAuthToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            req.userId = decoded.userId;
            return res.redirect('/dashboard');
        } catch (error) {
            console.log("Invalid or expired token. Proceeding to login.");
        }
    }
    next();
};

const authMiddleware = (req, res, next) => {
    console.log("AuthMiddleware: Checking token...");
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        console.log("AuthMiddleware: No token found. Unauthorized access!");
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        console.log("AuthMiddleware: Token verified, proceeding...");
        next();
    } catch (error) {
        console.log("AuthMiddleware: Invalid token");
        return res.status(401).json({ message: "Unauthorized" });
    }
};

router.get("/admin", checkAuthToken, async (req, res) => {
    res.render("admin/adminIndex");
});

router.post("/admin", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const images = await Images.find();
        const imagesByService = {};
        images.forEach(image => {
            const service = image.service || "Uncategorized";
            if (!imagesByService[service]) {
                imagesByService[service] = [];
            }
            imagesByService[service].push(image);
        });
        res.render("admin/dashboard", { imagesByService, layout: adminLayout });
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: "User Created", user });
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ message: "User already in use" });
        }
        res.status(500).json({ message: "internal server error" });
    }
});

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    const imageId = req.params.id;
    try {
        const image = await Images.findById(imageId);
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }
        console.log("Found image in DB:", image);
        const publicId = image.public_id;
        if (!publicId) {
            return res.status(400).json({ error: "Public ID is missing" });
        }
        const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
        if (cloudinaryResult.result !== 'ok') {
            return res.status(500).json({ error: "Error deleting image from Cloudinary" });
        }
        await Images.findByIdAndDelete(imageId);
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;