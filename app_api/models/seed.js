const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Trip = require('./travlr');

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbName = process.env.DB_NAME || 'travlr';
const dbURI = `mongodb://${dbHost}/${dbName}`;

const seedFile = path.join(
    __dirname,
    '../../app_server/data/trips.json'
);

const seedDatabase = async () => {
    try {
        const trips = JSON.parse(
            fs.readFileSync(seedFile, 'utf8')
        );

        // Validate all seed records before modifying the database.
        for (const tripData of trips) {
            const trip = new Trip(tripData);
            await trip.validate();
        }

        await mongoose.connect(dbURI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log(`Connected to MongoDB database: ${dbName}`);

        let inserted = 0;
        let existing = 0;

        for (const tripData of trips) {
            const result = await Trip.updateOne(
                { code: tripData.code },
                { $setOnInsert: tripData },
                { upsert: true, runValidators: true }
            );

            if (result.upsertedCount === 1) {
                inserted++;
            } else {
                existing++;
            }
        }

        console.log(`Seed records processed: ${trips.length}`);
        console.log(`New trips inserted: ${inserted}`);
        console.log(`Existing trips preserved: ${existing}`);

    } catch (error) {
        console.error('Database seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
};

seedDatabase();