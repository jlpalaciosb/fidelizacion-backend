const Cliente = require('../models').Cliente;
const Concepto = require('../models').Concepto;
const Bolsa = require('../models').Bolsa;
const Uso = require('../models').Uso;
const Op = require('sequelize').Op;

module.exports = {
  /* valida el cliente y el concepto y que el cliente tiene la cantidad necesaria de puntos */
  validarUsarPuntos(req, res, next) {
    const clienteId = req.body.clienteId;
    const conceptoId = req.body.conceptoId;
    if(typeof(clienteId) !== 'number' || typeof(conceptoId) !== 'number') { // tambien verifica que este definido
      res.status(400).send({error: 'especifique (correctamente) los ids del cliente y del concepto'});
    } else {
      Cliente.findByPk(clienteId).then((cliente) => {
        if(cliente === null) {
          res.status(400).send({error: 'no existe cliente con el id recibido'});
        } else {
          req.cliente = cliente;
          return Concepto.findByPk(conceptoId);
        }
      }).then((concepto) => {
        if(concepto === null) {
          res.status(400).send({error: 'no existe concepto con el id recibido'});
        } else {
          req.concepto = concepto;
          return Bolsa.findAll({
            where: {
              cliente_id: clienteId,
              fechaCaducidad: {[Op.gt]: new Date()},
              saldo: {[Op.gt]: 0},
            },
            order: [['fechaCaducidad', 'ASC'],],
          });
        }
      }).then((bolsas) => {
        var c = 0;
        bolsas.forEach(bolsa => c += bolsa.saldo);
        if(c < req.concepto.requerido) {
          res.status(400).send({error: 'el cliente no tiene la cantidad requerida de puntos'});
        } else {
          req.bolsas = bolsas;
          next();
        }
      });
    }
  },

  /* usa los puntos (una vez validado) */
  usarPuntos(req, res) {
    const cliente = req.cliente;
    const concepto = req.concepto;
    const bolsas = req.bolsas;
    res.status(200).send({cliente, concepto, bolsas});
  }
};
