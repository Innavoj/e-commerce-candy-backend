'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, {
        foreignKey: 'category_id',
        onDelete: 'RESTRICT'
      });
      Category.belongsTo(models.Category, {
        as: 'ParentCategory',
        foreignKey: 'parent_category_id',
        onDelete: 'RESTRICT'
      });
      Category.hasMany(models.Category, {
        as: 'Subcategories',
        foreignKey: 'parent_category_id'
      });
    }
  }
  Category.init({
    category_id: {
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
    },
    parent_category_id: {
      type: DataTypes.UUID,
      references: {
        model: 'categories', // Table name
        key: 'category_id'
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Category;
};