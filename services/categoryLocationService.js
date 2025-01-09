const path = require('path');
const db = require('../config/database');

class CategoryLocationService {
    async getReportData() {
        const connection = await db.getConnection();
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

module.exports = CategoryLocationService; 