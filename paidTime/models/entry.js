"use strict";

module.exports = function(sequelize, DataTypes) {
  var Entry = sequelize.define('Entry', {
    date: {type: DataTypes.STRING, allowNull: false},
    hours: {type: DataTypes.INTEGER, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    rate: {type: DataTypes.FLOAT, allowNull: false},
    status: {type: DataTypes.STRING, allowNull: false, defaultValue: 'PENDING'}
  });

  return Entry;
};
