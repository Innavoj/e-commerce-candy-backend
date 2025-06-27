'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Brand extends Model {
    static associate(models) {
      Brand.hasMany(models.Product, {
        foreignKey: 'brand_id',
        onDelete: 'SET NULL'
      });
    }
  }
  Brand.init({
    brand_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Brand',
    tableName: 'brands',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Brand;
};