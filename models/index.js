const sequelize = require('../config/sequelize');
const ActivityLog = require('./ActivityLog');

const models = {
    ActivityLog
};

// Initialize all models
Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

module.exports = {
    sequelize,
    ...models
}; 