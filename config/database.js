const mysql = require('mysql2/promise');

const createConnectionConfig = () => {
    return {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD.replace(/^["'](.+(?=["']$))["']$/, '$1'),
        database: process.env.DB_DATABASE,
        charset: process.env.DB_CHARSET,
        port: 3306,
        connectTimeout: 60000,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true,
        timezone: 'Z',
        ssl: false,
        authSwitchHandler: (data, cb) => {
            cb(null, Buffer.from(process.env.DB_PASSWORD.replace(/^["'](.+(?=["']$))["']$/, '$1')));
        }
    };
};

const getConnection = async (retries = 3) => {
    while (retries > 0) {
        try {
            const config = createConnectionConfig();
            const connection = await mysql.createConnection(config);
            console.log('Database connected successfully');
            return connection;
        } catch (err) {
            console.error(`Connection attempt ${4 - retries} failed:`, {
                code: err.code,
                errno: err.errno,
                sqlState: err.sqlState,
                sqlMessage: err.sqlMessage
            });

            retries--;
            if (retries === 0) throw err;

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

module.exports = { getConnection }; 