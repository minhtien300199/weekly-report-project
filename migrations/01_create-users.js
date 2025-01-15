const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');

async function createUsersTable() {
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Create default admin user
        const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);
        await sequelize.query(`
            INSERT INTO users (username, password) 
            VALUES ('admin', '${hashedPassword}')
            ON DUPLICATE KEY UPDATE password = '${hashedPassword}';
        `);

        console.log('Users table and default admin created successfully');
    } catch (error) {
        console.error('Error creating users table:', error);
        process.exit(1);
    }
}

module.exports = { createUsersTable }; 