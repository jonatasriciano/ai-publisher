const { createLogger, format, transports } = require('winston');

// Define custom formats
const { combine, timestamp, json, colorize, printf } = format;

// Custom log format for the console
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// Create the logger instance
const logger = createLogger({
  level: 'info', // Default log level
  format: combine(
    timestamp(), // Add a timestamp to log entries
    json() // Log entries in JSON format (useful for file transport)
  ),
  transports: [
    // Log errors to a file
    new transports.File({
      filename: 'error.log', // File name for error logs
      level: 'error', // Log only error-level messages in this file
    }),

    // Log all messages to the console with a custom format
    new transports.Console({
      format: combine(
        colorize(), // Add colors to log levels (info, error, etc.)
        consoleFormat // Use the custom format for console logs
      ),
    }),
  ],
});

// Export the logger instance for use in other modules
module.exports = logger;