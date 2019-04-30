'use strict';

module.exports = (sequelize, DataTypes) => {
  const Bolsa = sequelize.define(
    'Bolsa',
    {
      fechaAsignacion: {
        type: DataTypes.DATE,
        field: 'fecha_asignacion'
      },
      fechaCaducidad: {
        type: DataTypes.DATE,
        field: 'fecha_caducidad'
      },
      asignado: DataTypes.INTEGER,
      utilizado: DataTypes.INTEGER,
      saldo: DataTypes.INTEGER,
      montoOp: {
          type: DataTypes.INTEGER,
          field: 'monto_op'
      }
    },
    {
      tableName: 'bolsa',
      timestamps: false
    }
  );

  Bolsa.associate = function(models) {
    Bolsa.belongsTo(models.Cliente, {foreignKey: 'cliente_id'});
    Bolsa.hasMany(models.UsoDetalle, {as: 'usosDetalles', foreignKey: 'bolsa_id'});
  };

  return Bolsa;
};
