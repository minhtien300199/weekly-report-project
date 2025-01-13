const LoggingService = require('../services/loggingService');
const { decodeToken } = require('../utils/tokenUtil');

const activityLogger = (action, details = {}) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies.token;
            const decoded = token ? decodeToken(token) : null;
            const username = decoded?.username || 'anonymous';
            const logger = new LoggingService(username);
            await logger.logActivity(action, {
                ...details,
                path: req.path,
                method: req.method
            });
        } catch (error) {
            console.error('Logging middleware error:', error);
        }
        next();
    };
};

module.exports = activityLogger; 