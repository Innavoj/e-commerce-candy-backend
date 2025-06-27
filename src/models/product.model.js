'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        allowNull: false,
        onDelete: 'RESTRICT'
      });
      Product.belongsTo(models.Brand, {
        foreignKey: 'brand_id',
        allowNull: true, // brand_id can be null
        onDelete: 'SET NULL'
      });
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        onDelete: 'RESTRICT'
      });
    }
  }
  Product.init({
    product_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    brand_id: {
      type: DataTypes.UUID // Can be null
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    sku: {
      type: DataTypes.STRING(50),
      unique: true
    },
    image_url: {
      type: DataTypes.TEXT
    },
    weight_grams: {
      type: DataTypes.INTEGER
    },
    allergens: {
      type: DataTypes.TEXT
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Product;
};