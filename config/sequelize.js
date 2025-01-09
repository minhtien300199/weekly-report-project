const { Sequelize } = require('sequelize');

// Add environment variable validation
if (!process.env.DB_RW_USER || !process.env.DB_RW_PASSWORD || !process.env.DB_RW_DATABASE) {
    console.error('Missing required environment variables:', {
        DB_RW_USER: !!process.env.DB_RW_USER,
        DB_RW_PASSWORD: !!process.env.DB_RW_PASSWORD,
        DB_RW_DATABASE: !!process.env.DB_RW_DATABASE,
        DB_RW_HOST: process.env.DB_RW_HOST
    });
    throw new Error('Missing required database configuration');
}

const sequelize = new Sequelize(
    process.env.DB_RW_DATABASE,
    process.env.DB_RW_USER,
    process.env.DB_RW_PASSWORD,
    {
        host: process.env.DB_RW_HOST,
        dialect: 'mysql',
        timezone: '+00:00',
        define: {
            timestamps: true,
            underscored: true
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: console.log,
        dialectOptions: {
            connectTimeout: 60000,
            supportBigNumbers: true,
            bigNumberStrings: true
        }
    }
);

// Test the connection with better error handling
const testConnection = async () => {
    try {
        console.log('Attempting to connect with config:', {
            host: process.env.DB_RW_HOST,
            user: process.env.DB_RW_USER,
            database: process.env.DB_RW_DATABASE,
            password_length: process.env.DB_RW_PASSWORD?.length
        });

        await sequelize.authenticate();
        console.log('Read-Write Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the Read-Write database:', {
            message: error.message,
            code: error.original?.code,
            errno: error.original?.errno,
            sqlState: error.original?.sqlState,
            sqlMessage: error.original?.sqlMessage
        });
        throw error;
    }
};

testConnection();

module.exports = sequelize; 