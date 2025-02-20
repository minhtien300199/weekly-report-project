const path = require('path');
const db = require('../config/database');
const { ActivityLog } = require('../models');

class CategoryLocationService {
    async getReportData() {
        const connection = await db.getReadOnlyConnection();
        try {
            const query = require('fs').readFileSync(
                path.join(__dirname, '..', 'queries', 'get-location-category-total-acts.sql'),
                'utf8'
            );

            const [results] = await connection.execute(query);
            return results;
        } finally {
            await connection.end();
        }
    }
}

class LoggingService {
    constructor(req) {
        this.username = req?.user?.username || 'anonymous';
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

module.exports = {
    CategoryLocationService,
    LoggingService
}; 