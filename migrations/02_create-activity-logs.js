// Load environment variables first
require('dotenv').config();

const sequelize = require('../config/sequelize');

async function createActivityLogsTable() {
    try {
        // Log environment variables to verify they're loaded
        console.log('Migration environment check:', {
            host: process.env.DB_RW_HOST,
            user: process.env.DB_RW_USER,
            database: process.env.DB_RW_DATABASE,
            has_password: !!process.env.DB_RW_PASSWORD
        });

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Activity logs table created successfully');
    } catch (error) {
        console.error('Error creating activity logs table:', error);
        process.exit(1);
    }
}

// Run the migration
createActivityLogsTable();

module.exports = { createActivityLogsTable }; 