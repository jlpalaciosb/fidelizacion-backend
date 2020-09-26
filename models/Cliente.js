'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define(
    'Cliente',
    {
      // sequelize asume que la tabla tiene una columna `id`
      nombre: DataTypes.STRING,
      apellido: DataTypes.STRING,
      nroDocumento: {
        type: DataTypes.STRING,
        field: 'nro_documento'
      },
      tipoDocumento: {
        type: DataTypes.STRING,
        field: 'tipo_documento'
      },
      pais: DataTypes.STRING,
      email: DataTypes.STRING,
      telefono: DataTypes.STRING,
      nacimiento: DataTypes.DATEONLY
    },
    {
      tableName: 'cliente',
      timestamps: false
    }
  );

  Cliente.associate = function(models) {
    Cliente.hasMany(models.Bolsa, {as: 'bolsas', foreignKey: 'cliente_id'});
    Cliente.hasMany(models.Uso, {as: 'usos', foreignKey: 'cliente_id'});
  };

  return Cliente;
};
