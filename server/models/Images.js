const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    public_id: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true,
        enum: ["Aer Conditionat", "Instalatii Sanitare", "Servicii Electrice", "Zugravit"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
