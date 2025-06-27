'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Address extends Model {
    static associate(models) {
      Address.hasMany(models.Order, { // An address can be used for multiple orders
        foreignKey: 'delivery_address_id',
        onDelete: 'RESTRICT'
      });
    }
  }
  Address.init({
    address_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state_province: {
      type: DataTypes.STRING(100)
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    additional_info: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Address;
};