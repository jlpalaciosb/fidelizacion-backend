'use strict';

module.exports = (sequelize, DataTypes) => {
  const Regla = sequelize.define(
    'Regla',
    {
      limInferior: {
        type: DataTypes.INTEGER,
        field: 'lim_inferior'
      },
      limSuperior: {
        type: DataTypes.INTEGER,
        field: 'lim_superior'
      },
      equivalencia: DataTypes.INTEGER
    },
    {
      tableName: 'regla',
      timestamps: false
    }
  );

  Regla.associate = function(models) {
    
  };

  return Regla;
};
