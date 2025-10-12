/**
 * Logger utility for consistent logging across the application
 *
 * This module provides logging functions with timestamps and consistent formatting
 * to make it easier to trace the flow of events in the application.
 */

// Log levels
const LOG_LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

/**
 * Format a log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Optional data to include in the log
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, data) => {
    const timestamp = new Date().toISOString();

    return `[${timestamp}] [${level}] ${message}${data ? ': ' + JSON.stringify(data) : ''}`;
};

/**
 * Log a debug message
 * @param {string} message - Log message
 * @param {Object} data - Optional data to include in the log
 */
const debug = (message, data) => {
    console.debug(formatLogMessage(LOG_LEVELS.DEBUG, message, data));
};

/**
 * Log an info message
 * @param {string} message - Log message
 * @param {Object} data - Optional data to include in the log
 */
const info = (message, data) => {
    console.info(formatLogMessage(LOG_LEVELS.INFO, message, data));
};

/**
 * Log a warning message
 * @param {string} message - Log message
 * @param {Object} data - Optional data to include in the log
 */
const warn = (message, data) => {
    console.warn(formatLogMessage(LOG_LEVELS.WARN, message, data));
};

/**
 * Log an error message
 * @param {string} message - Log message
 * @param {Object} error - Error object or data to include in the log
 */
const error = (message, error) => {
    if (error instanceof Error) {
        console.error(formatLogMessage(LOG_LEVELS.ERROR, message, {
            name: error.name,
            message: error.message,
            stack: error.stack
        }));
    } else {
        console.error(formatLogMessage(LOG_LEVELS.ERROR, message, error));
    }
};

// Export the logger functions
const logger = {
    debug,
    info,
    warn,
    error
};

export default logger;
