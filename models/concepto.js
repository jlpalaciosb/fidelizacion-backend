'use strict';

module.exports = (sequelize, DataTypes) => {
  const Concepto = sequelize.define(
    'Concepto',
    {
      descripcion: DataTypes.STRING,
      requerido: DataTypes.INTEGER
    },
    {
      tableName: 'concepto',
      timestamps: false
    }
  );

  Concepto.associate = function(models) {
    Concepto.hasMany(models.Uso, {as: 'usos', foreignKey: 'concepto_id'});
  };

  return Concepto;
};
