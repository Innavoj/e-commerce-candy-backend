'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        allowNull: false,
        onDelete: 'RESTRICT'
      });
      Order.belongsTo(models.Address, {
        as: 'DeliveryAddress',
        foreignKey: 'delivery_address_id',
        allowNull: false,
        onDelete: 'RESTRICT'
      });
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE'
      });
      Order.hasMany(models.Payment, {
        foreignKey: 'order_id',
        onDelete: 'RESTRICT'
      });
    }
  }
  Order.init({
    order_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { min: 0 }
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { min: 0 }
    },
    final_amount: { // This should ideally be calculated, ensure your application logic handles this.
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    shipping_method: {
      type: DataTypes.ENUM('local_pickup', 'home_delivery'),
      allowNull: false
    },
    payment_method: { // This seems to be duplicated from the payments table. Consider if it's needed here if payments table holds this.
      type: DataTypes.ENUM('stripe', 'paypal', 'mercadopago', 'cash_on_delivery', 'bank_transfer'),
      allowNull: false
    },
    tracking_number: {
      type: DataTypes.STRING(100)
    },
    delivery_address_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    customer_notes: {
      type: DataTypes.TEXT
    },
    admin_notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Order;
};