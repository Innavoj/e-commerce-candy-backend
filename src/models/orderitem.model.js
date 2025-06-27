'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id',
        allowNull: false,
        onDelete: 'CASCADE'
      });
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        allowNull: false,
        onDelete: 'RESTRICT'
      });
    }
  }
  OrderItem.init({
    order_item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    price_at_purchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    subtotal: { // This is a generated column in PostgreSQL.
                // Sequelize won't set it, but it will be readable.
      type: DataTypes.DECIMAL(10, 2),
      // Not managed by Sequelize setter/getter, DB handles it.
      // If you need to access it in code, ensure it's selected.
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      // If not using DB generated column, you could calculate subtotal here
      // beforeValidate: (orderItem) => {
      //   if (orderItem.quantity && orderItem.price_at_purchase) {
      //     orderItem.subtotal = orderItem.quantity * orderItem.price_at_purchase;
      //   }
      // }
    }
  });
  return OrderItem;
};