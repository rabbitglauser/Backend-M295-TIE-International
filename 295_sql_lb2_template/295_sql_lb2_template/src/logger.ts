import winston from 'winston';

// Define the custom log format
const customFormat = winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// Create the logger with Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        customFormat
    ),
    transports: [
        new winston.transports.Console(), // Output to console
        new winston.transports.File({ filename: 'logs/app.log' }) // Output to file
    ]
});

export default logger;
