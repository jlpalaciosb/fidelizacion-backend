'use strict';

module.exports = (sequelize, DataTypes) => {
  const Uso = sequelize.define(
    'Uso',
    {
      utilizado: DataTypes.INTEGER,
      fecha: DataTypes.DATE
    },
    {
      tableName: 'uso',
      timestamps: false
    }
  );

  Uso.associate = function(models) {
    Uso.belongsTo(models.Cliente, {as: 'cliente', foreignKey: 'cliente_id'});
    Uso.belongsTo(models.Concepto, {as: 'concepto', foreignKey: 'concepto_id'});
    Uso.hasMany(models.UsoDetalle, {as: 'detalles', foreignKey: 'uso_id'});
  };

  return Uso;
};
