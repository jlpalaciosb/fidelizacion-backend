const Bolsa = require('../models').Bolsa;
const Cliente = require('../models').Cliente;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {

  /* middleware para procesar los query params para la lista de bolsas */
  procesarQueryParams(req, res, next) {
    req.bolsa = {};

    req.bolsa.clienteId = parseInt(req.query.clienteId);
    if(Number.isNaN(req.bolsa.clienteId)) req.bolsa.clienteId = null;

    req.bolsa.venceEn = parseInt(req.query.venceEn);
    if(Number.isNaN(req.bolsa.venceEn)) req.bolsa.venceEn = null;

    req.bolsa.estado = req.query.estado;
    if(!['vigente', 'vencido'].includes(req.bolsa.estado)) req.bolsa.estado = null; // el estado debe ser 'vigente' o 'vencido'
    
    next();
  },

  /* envía la lista de bolsas */
  list(req, res) {
    const where = {};

    if(req.bolsa.clienteId !== null) {
      where.cliente_id = req.bolsa.clienteId;
    }
    
    where.fechaCaducidad = {};

    if(req.bolsa.venceEn !== null) {
      /* req.bolsa.venceEn -> tipo : int , unidad de medida : días */
      const dt1 = new Date(); const dt2 = new Date();
      dt1.setTime(dt1.getTime() + req.bolsa.venceEn * 24 * 60 * 60 * 1000); // instante1 = ahora + x dias (un dia = 24 horas)
      dt2.setTime(dt2.getTime() + (req.bolsa.venceEn + 1) * 24 * 60 * 60 * 1000); // instante2 = ahora + (x + 1) dias
      where.fechaCaducidad = {[Op.gte]: dt1, [Op.lte]: dt2};
    }

    if(req.bolsa.estado !== null) {
      var whereEstado;
      if(req.bolsa.estado === 'vigente') {
        whereEstado = {[Op.gt]: new Date()};
      } else {
        whereEstado = {[Op.lt]: new Date()};
      }
      Object.assign(where.fechaCaducidad, whereEstado); // agrega la condición extra para fechaCaducidad
    }

    Bolsa.findAll({
      attributes: {exclude: ['cliente_id']},
      include: [{model: Cliente, as: 'cliente'}],
      where: where,
    })
      .then(bolsas => res.status(200).send(bolsas))
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  },

};
