const mongoose = require('mongoose');
const Trip = mongoose.model('trips');

// Sends a consistent error response without exposing internal error details
const sendErrorResponse = (res, status, message, err) => {
    if (err) {
        console.error(message, err.message);
    }

    return res
        .status(status)
        .json({ message });
};

// Validates trip data before it is sent to the database
const validateTripData = (data) => {
    const errors = [];

    const requiredFields = [
        'code',
        'name',
        'length',
        'start',
        'resort',
        'perPerson',
        'image',
        'description'
    ];

    // Check for missing or blank required fields
    requiredFields.forEach((field) => {
        if (
            data[field] === undefined ||
            data[field] === null ||
            String(data[field]).trim() === ''
        ) {
            errors.push(`${field} is required`);
        }
    });

    // Validate trip code
    if (data.code) {
        const code = String(data.code).trim();

        if (code.length < 3 || code.length > 10) {
            errors.push(
                'code must be between 3 and 10 characters'
            );
        }

        if (!/^[A-Za-z0-9]+$/.test(code)) {
            errors.push(
                'code can only contain letters and numbers'
            );
        }
    }

    // Validate field lengths
    if (data.name && String(data.name).length > 100) {
        errors.push('name cannot exceed 100 characters');
    }

    if (data.length && String(data.length).length > 50) {
        errors.push('length cannot exceed 50 characters');
    }

    if (data.resort && String(data.resort).length > 100) {
        errors.push('resort cannot exceed 100 characters');
    }

    if (data.image && String(data.image).length > 255) {
        errors.push('image cannot exceed 255 characters');
    }

    if (
        data.description &&
        String(data.description).length > 1000
    ) {
        errors.push(
            'description cannot exceed 1000 characters'
        );
    }

    // Validate price format
    if (
        data.perPerson &&
        !/^\d+(\.\d{1,2})?$/.test(
            String(data.perPerson).trim()
        )
    ) {
        errors.push(
            'perPerson must be a positive number with no more than two decimal places'
        );
    }

    // Validate date
    if (data.start) {
        const startDate = new Date(data.start);

        if (Number.isNaN(startDate.getTime())) {
            errors.push('start must be a valid date');
        }
    }

    return errors;
};

// GET: /trips
// Returns all trips
const tripsList = async (req, res) => {
    try {
        const trips = await Trip
            .find({})
            .exec();

        if (trips.length === 0) {
            return res
                .status(404)
                .json({ message: 'No trips found' });
        }

        return res
            .status(200)
            .json(trips);
    } catch (err) {
        return sendErrorResponse(
            res,
            500,
            'Unable to retrieve trips',
            err
        );
    }
};

// GET: /trips/:tripCode
// Returns a specific trip
const tripsFindByCode = async (req, res) => {
    try {
        const trip = await Trip
            .findOne({ code: req.params.tripCode })
            .exec();

        if (!trip) {
            return res
                .status(404)
                .json({ message: 'Trip not found' });
        }

        return res
            .status(200)
            .json(trip);
    } catch (err) {
        return sendErrorResponse(
            res,
            500,
            'Unable to retrieve trip',
            err
        );
    }
};

// POST: /trips
// Adds a new trip
const tripsAddTrip = async (req, res) => {
    const validationErrors = validateTripData(req.body);

    if (validationErrors.length > 0) {
        return res
            .status(400)
            .json({
                message: 'Invalid trip data',
                errors: validationErrors
            });
    }

    try {
        const trip = await Trip.create({
            code: req.body.code.trim(),
            name: req.body.name.trim(),
            length: req.body.length.trim(),
            start: req.body.start,
            resort: req.body.resort.trim(),
            perPerson: String(req.body.perPerson).trim(),
            image: req.body.image.trim(),
            description: req.body.description.trim()
        });

        return res
            .status(201)
            .json(trip);
    } catch (err) {
        return sendErrorResponse(
            res,
            400,
            'Unable to add trip',
            err
        );
    }
};

// PUT: /trips/:tripCode
// Updates an existing trip
const tripsUpdateTrip = async (req, res) => {
    const validationErrors = validateTripData(req.body);

    if (validationErrors.length > 0) {
        return res
            .status(400)
            .json({
                message: 'Invalid trip data',
                errors: validationErrors
            });
    }

    try {
        const trip = await Trip
            .findOneAndUpdate(
                { code: req.params.tripCode },
                {
                    code: req.body.code.trim(),
                    name: req.body.name.trim(),
                    length: req.body.length.trim(),
                    start: req.body.start,
                    resort: req.body.resort.trim(),
                    perPerson: String(
                        req.body.perPerson
                    ).trim(),
                    image: req.body.image.trim(),
                    description:
                        req.body.description.trim()
                },
                {
                    new: true,
                    runValidators: true
                }
            )
            .exec();

        if (!trip) {
            return res
                .status(404)
                .json({ message: 'Trip not found' });
        }

        return res
            .status(200)
            .json(trip);
    } catch (err) {
        return sendErrorResponse(
            res,
            400,
            'Unable to update trip',
            err
        );
    }
};

// DELETE: /trips/:tripCode
// Deletes an existing trip
const tripsDeleteTrip = async (req, res) => {
    try {
        const trip = await Trip
            .findOneAndDelete({
                code: req.params.tripCode
            })
            .exec();

        if (!trip) {
            return res
                .status(404)
                .json({ message: 'Trip not found' });
        }

        return res
            .status(200)
            .json({
                message: 'Trip deleted successfully'
            });
    } catch (err) {
        return sendErrorResponse(
            res,
            500,
            'Unable to delete trip',
            err
        );
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip,
    tripsDeleteTrip
};