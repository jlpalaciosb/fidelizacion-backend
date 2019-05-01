const models=require('../models');

module.exports = {
  getUso(req, res) {
      var where={

      };
      if(req.query.idCliente){
          where={cliente_id:req.query.idCliente}
      }else {
          if (req.query.idConcepto) {
              where = {concepto_id: req.query.idConcepto}
          } else {
              if (req.query.fechaInicio && req.query.fechaFin) {
                  where = {
                      [models.Sequelize.Op.and]: [{ fecha:{[models.Sequelize.Op.gte]: req.query.fechaInicio}}, {fecha:{[models.Sequelize.Op.lte]: req.query.fechaFin}}]
                  }
              }
          }
      }



    return models.Uso.findAll({
        attributes:['id','utilizado','fecha'],
        include:[{model:models.Cliente, as: 'Cliente'},{model:models.Concepto, as: 'Concepto'}],
        where:where
    })
      .then(usos => res.status(200).send(usos))
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  }
};
