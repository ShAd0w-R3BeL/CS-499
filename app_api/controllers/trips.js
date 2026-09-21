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
    try {
        const trip = await Trip.create({
            code: req.body.code,
            name: req.body.name,
            length: req.body.length,
            start: req.body.start,
            resort: req.body.resort,
            perPerson: req.body.perPerson,
            image: req.body.image,
            description: req.body.description
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
    try {
        const trip = await Trip
            .findOneAndUpdate(
                { code: req.params.tripCode },
                {
                    code: req.body.code,
                    name: req.body.name,
                    length: req.body.length,
                    start: req.body.start,
                    resort: req.body.resort,
                    perPerson: req.body.perPerson,
                    image: req.body.image,
                    description: req.body.description
                },
                { new: true, runValidators: true }
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
            .findOneAndDelete({ code: req.params.tripCode })
            .exec();

        if (!trip) {
            return res
                .status(404)
                .json({ message: 'Trip not found' });
        }

        return res
            .status(200)
            .json({ message: 'Trip deleted successfully' });
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