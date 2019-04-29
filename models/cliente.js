'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define(
    'Cliente',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
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
    // associations can be defined here
  };

  return Cliente;
};
