const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SearchQuota = sequelize.define('SearchQuota', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'search_quotas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = SearchQuota; 