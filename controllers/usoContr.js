const Uso = require('../models').Uso;
const Cliente=require('../models').Cliente;
const Concepto=require('../models').Concepto;
module.exports = {
  getUso(req, res) {
    return Uso.findAll({
        include:[{model:Cliente, as: 'Cliente'},{model:Concepto, as: 'Concepto'}]
    })
      .then(usos => res.status(200).send(usos))
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  }
};
