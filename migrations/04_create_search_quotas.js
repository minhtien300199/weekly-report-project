const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

async function up() {
    try {
        await sequelize.getQueryInterface().createTable('search_quotas', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            count: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        });

        // Add unique constraint for user_id and date combination
        await sequelize.getQueryInterface().addIndex('search_quotas', ['user_id', 'date'], {
            unique: true
        });
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

module.exports = { up }; 