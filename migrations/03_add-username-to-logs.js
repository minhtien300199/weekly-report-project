const sequelize = require('../config/sequelize');

async function addUsernameToLogs() {
    try {
        // Check if column exists
        const [columns] = await sequelize.query(`
            SHOW COLUMNS FROM activity_logs LIKE 'username';
        `);

        if (columns.length === 0) {
            // Add username column if it doesn't exist
            await sequelize.query(`
                ALTER TABLE activity_logs 
                ADD COLUMN username VARCHAR(255) NOT NULL DEFAULT 'system' 
                AFTER action;
            `);
            console.log('Username column added to activity_logs table');
        } else {
            console.log('Username column already exists in activity_logs table');
        }
    } catch (error) {
        console.error('Error adding username column:', error);
        throw error;
    }
}

module.exports = { addUsernameToLogs }; 