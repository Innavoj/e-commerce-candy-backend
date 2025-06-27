'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: 'order_id',
        allowNull: false,
        onDelete: 'RESTRICT'
      });
    }
  }
  Payment.init({
    payment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    transaction_id: { // From payment gateway
      type: DataTypes.STRING(255),
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 }
    },
    payment_method: {
      type: DataTypes.ENUM('stripe', 'paypal', 'mercadopago', 'cash_on_delivery', 'bank_transfer'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    raw_response: { // For storing gateway response
      type: DataTypes.JSONB
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Payment;
};