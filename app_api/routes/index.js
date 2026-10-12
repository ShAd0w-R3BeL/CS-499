const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require('express-jwt');

const tripsController = require('../controllers/trips');
const authenticationController = require('../controllers/authentication');

const auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
});

router
    .route('/trips')
    .get(tripsController.tripsList)
    .post(auth, tripsController.tripsAddTrip);

// Protected trip analytics endpoint
router
    .route('/trips/analytics')
    .get(auth, tripsController.tripsAnalytics);

router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(auth, tripsController.tripsUpdateTrip)
    .delete(auth, tripsController.tripsDeleteTrip);

router
    .route('/register')
    .post(authenticationController.register);

router
    .route('/login')
    .post(authenticationController.login);

module.exports = router;