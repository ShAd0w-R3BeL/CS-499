const mongoose = require('mongoose');

// Shared validation for required text fields
const requiredText = (maxLength) => ({
    type: String,
    required: true,
    trim: true,
    maxlength: maxLength
});

// Define the trip schema
const tripSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 10,
        match: /^[A-Za-z0-9]+$/,
        unique: true
    },
    name: requiredText(100),
    length: requiredText(50),
    start: {
        type: Date,
        required: true
    },
    resort: requiredText(100),
    perPerson: {
    type: Number,
    required: true,
    min: [0.01, 'Price must be greater than zero'],
    validate: {
        validator: (value) =>
            Number.isFinite(value) &&
            Math.abs(
                value * 100 - Math.round(value * 100)
            ) < 1e-8,
        message: 'Price cannot exceed two decimal places'
        }
    },
    image: requiredText(255),
    description: requiredText(1000)
});

const Trip = mongoose.model('trips', tripSchema);

module.exports = Trip;