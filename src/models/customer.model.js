'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.Order, {
        foreignKey: 'customer_id',
        onDelete: 'RESTRICT'
      });
    }
  }
  Customer.init({
    customer_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone_number: {
      type: DataTypes.STRING(50)
    },
    password_hash: {
      type: DataTypes.TEXT // Optional
    }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Customer;
};