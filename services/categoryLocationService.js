const path = require('path');
const db = require('../config/database');

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
    async logActivity(action, details) {
        const connection = await db.getReadWriteConnection();
        try {
            const query = 'INSERT INTO activity_logs (action, details, created_at) VALUES (?, ?, NOW())';
            await connection.execute(query, [action, JSON.stringify(details)]);
        } finally {
            await connection.end();
        }
    }
}

module.exports = {
    CategoryLocationService,
    LoggingService
}; 