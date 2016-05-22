"use strict";

module.exports = function(sequelize, DataTypes) {
  var Order = sequelize.define('Order', {
    customerName: {type: DataTypes.STRING, allowNull: false},
    productCode: {type: DataTypes.STRING, allowNull: false},
    unitsOrdered: {type: DataTypes.INTEGER, allowNull: false},
    unitPrice: {type: DataTypes.FLOAT, allowNull: false},
    status: {type: DataTypes.STRING, allowNull: false, defaultValue: 'PENDING'}
  });

  return Order;
};
