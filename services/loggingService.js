const { ActivityLog } = require('../models');

class LoggingService {
    constructor(username = 'anonymous') {
        this.username = username;
    }

    async logActivity(action, details = {}) {
        try {
            await ActivityLog.create({
                action,
                username: this.username,
                details: JSON.stringify(details)
            });
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }
}

module.exports = LoggingService; 