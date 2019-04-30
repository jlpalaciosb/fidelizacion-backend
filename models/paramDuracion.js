'use strict';

module.exports = (sequelize, DataTypes) => {
  const ParamDuracion = sequelize.define(
    'ParamDuracion',
    {
      validezIni: {
        type: DataTypes.DATE,
        field: 'validez_ini'
      },
      validezFin: {
        type: DataTypes.DATE,
        field: 'validez_fin'
      },
      duracion: DataTypes.INTEGER
    },
    {
      tableName: 'param_duracion',
      timestamps: false
    }
  );

  ParamDuracion.associate = function(models) {
    
  };

  return ParamDuracion;
};
