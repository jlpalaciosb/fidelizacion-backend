'use strict';

module.exports = (sequelize, DataTypes) => {
  const Premio = sequelize.define(
    'Premio',
    {
      descripcion: DataTypes.STRING,
      requerido: DataTypes.INTEGER
    },
    {
      tableName: 'premio',
      timestamps: false
    }
  );

  Premio.associate = function(models) {
    Premio.hasMany(models.Uso, {as: 'usos', foreignKey: 'premio_id'});
  };

  return Premio;
};
