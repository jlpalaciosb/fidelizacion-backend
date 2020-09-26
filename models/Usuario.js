'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'Usuario',
    {
      // sequelize asume que la tabla tiene una columna `id`
      nombreDeUsuario: {
        type: DataTypes.STRING,
        field: 'nombre_de_usuario',
      },
      contrasenhaHash: {
        type: DataTypes.STRING,
        field: 'contrasenha_hash',
      },
    },
    {
      tableName: 'usuario',
      timestamps: false
    }
  );
};
