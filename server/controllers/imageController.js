const Image = require("../models/Images");
const cloudinary = require("cloudinary").v2;

// Fetch images from the database and render them based on the service
const getImages = async (req, res) => {
    try {
        const services = ["Aer Conditionat", "Instalatii Sanitare", "Servicii Electrice", "Zugravit"];
        const imagesByService = {};

        for (const service of services) {
            imagesByService[service] = await Image.find({ service });
        }

        res.render("portofolio", { imagesByService }); // Pass images for each service
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading images");
    }
};

// Upload images to Cloudinary and save details to the database
const uploadImages = async (req, res) => {
    try {
        const { service } = req.body; // Get the service name from form

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded!" });
        }

        const uploadPromises = req.files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path);
            return {
                public_id: result.public_id,
                url: result.secure_url,
                filename: file.originalname,
                service: service
            };
        });

        const imageDocs = await Promise.all(uploadPromises);
        await Image.insertMany(imageDocs);

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading images");
    }
};

module.exports = { getImages, uploadImages };
