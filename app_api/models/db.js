const mongoose = require('mongoose');

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbName = process.env.DB_NAME || 'travlr';

const dbURI = `mongodb://${dbHost}/${dbName}`;

// Establish the database connection.
const connect = async () => {
    try {
        await mongoose.connect(dbURI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log(`MongoDB connected to database: ${dbName}`);
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);

        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.error(
                'MongoDB cleanup failed:',
                disconnectError.message
            );
        }

        process.exit(1);
    }
};

// Monitor database connection events.
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Close the database connection before shutting down.
let shuttingDown = false;

const gracefulShutdown = async (signal) => {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    try {
        await mongoose.connection.close();
        console.log(`MongoDB connection closed: ${signal}`);
    } catch (error) {
        console.error('MongoDB shutdown error:', error.message);
        process.exitCode = 1;
    }

    if (signal === 'SIGUSR2') {
        process.kill(process.pid, 'SIGUSR2');
    } else {
        process.exit();
    }
};

process.once('SIGUSR2', () => {
    gracefulShutdown('SIGUSR2');
});

process.once('SIGINT', () => {
    gracefulShutdown('SIGINT');
});

process.once('SIGTERM', () => {
    gracefulShutdown('SIGTERM');
});

// Register database models.
require('./travlr');
require('./user');

// Connect to MongoDB.
connect();

module.exports = mongoose;