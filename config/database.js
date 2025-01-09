const mysql = require('mysql2/promise');

const createReadOnlyConfig = () => ({
    host: process.env.DB_RO_HOST,
    user: process.env.DB_RO_USER,
    password: process.env.DB_RO_PASSWORD,
    database: process.env.DB_RO_DATABASE,
    charset: process.env.DB_RO_CHARSET,
    port: 3306,
    connectTimeout: 60000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    timezone: 'Z',
    ssl: false,
    authSwitchHandler: (data, cb) => {
        cb(null, Buffer.from(process.env.DB_RO_PASSWORD.replace(/^["'](.+(?=["']$))["']$/, '$1')));
    }
});

const createReadWriteConfig = () => ({
    host: process.env.DB_RW_HOST,
    user: process.env.DB_RW_USER,
    password: process.env.DB_RW_PASSWORD,
    database: process.env.DB_RW_DATABASE,
    charset: process.env.DB_RW_CHARSET,
    port: 3306,
    connectTimeout: 60000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    timezone: 'Z'
});

const getConnection = async (type = 'readonly', retries = 3) => {
    const config = type === 'readonly' ? createReadOnlyConfig() : createReadWriteConfig();

    while (retries > 0) {
        try {
            const connection = await mysql.createConnection(config);
            console.log(`Database (${type}) connected successfully`);
            return connection;
        } catch (err) {
            console.error(`Connection attempt ${4 - retries} failed for ${type} database:`, {
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

module.exports = {
    getReadOnlyConnection: () => getConnection('readonly'),
    getReadWriteConnection: () => getConnection('readwrite')
}; 