module.exports = {
    database: {
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    server: {
        trustProxy: true
    }
}; 