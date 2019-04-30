'use strict';

module.exports = (sequelize, DataTypes) => {
  const UsoDetalle = sequelize.define(
    'UsoDetalle',
    {
      utilizado: DataTypes.INTEGER
    },
    {
      tableName: 'uso_detalle',
      timestamps: false
    }
  );

  UsoDetalle.associate = function(models) {
    UsoDetalle.belongsTo(models.Uso, {foreignKey: 'uso_id'});
    UsoDetalle.belongsTo(models.Bolsa, {foreignKey: 'bolsa_id'});
  };

  return UsoDetalle;
};
