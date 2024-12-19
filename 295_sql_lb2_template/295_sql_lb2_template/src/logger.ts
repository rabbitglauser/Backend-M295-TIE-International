import winston from 'winston';

// Define the custom log format
const customFormat = winston.format.printf(({timestamp, level, message, stack}) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
});

// Create the logger with Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.errors({stack: true}), // Log stack trace for errors
        winston.format.timestamp(),
        customFormat
    ),
    defaultMeta: {service: 'user-service'}, // Add default metadata
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                customFormat
            )
        }), // Output to console
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error' // Separate file for errors
        }),
        new winston.transports.File({
            filename: 'logs/combined.log' // Output all logs to a combined file 
        })
    ]
});

export default logger;
