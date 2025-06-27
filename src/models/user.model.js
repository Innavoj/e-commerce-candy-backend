'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init({
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.TEXT,
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
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'viewer'),
      defaultValue: 'staff',
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return User;
};