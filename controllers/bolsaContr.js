const Bolsa = require('../models').Bolsa;
const Cliente = require('../models').Cliente;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {

  /* middleware para procesar los query params para la lista de bolsas */
  procesarQueryParams(req, res, next) {
    const clienteId = parseFloat(req.query.clienteId);
    const venceEn = parseFloat(req.query.venceEn);
    const estado = req.query.estado;

    if(req.query.clienteId !== undefined && !Number.isInteger(clienteId)) {
      res.status(400).send({error: 'especifique correctamente el id del cliente'});
    } else if(req.query.venceEn !== undefined && !Number.isInteger(venceEn)) {
      res.status(400).send({error: 'especifique correctamente en cuántos días es el vencimiento'});
    } else if(req.query.estado !== undefined && !['vigente', 'vencido'].includes(estado)) {
      res.status(400).send({error: 'especifique correctamente el estado de la bolsa'});
    } else {
      req.bolsa = {};
      if(req.query.clienteId !== undefined) req.bolsa.clienteId = clienteId;
      if(req.query.venceEn !== undefined) req.bolsa.venceEn = venceEn;
      if(req.query.estado !== undefined) req.bolsa.estado = estado;
      next();
    }
  },

  /* envía la lista de bolsas */
  list(req, res) {
    const where = {};

    if(req.bolsa.clienteId !== undefined) {
      where.cliente_id = req.bolsa.clienteId;
    }
    
    where.fechaCaducidad = {};
    var flag = false; // indica si hay que aplicar filtros a la fecha de caducidad

    if(req.bolsa.venceEn !== undefined) { flag = true;
      /* req.bolsa.venceEn -> tipo : int , unidad de medida : días */
      const dt1 = new Date(); const dt2 = new Date();
      dt1.setTime(dt1.getTime() + (req.bolsa.venceEn - 1) * 24 * 60 * 60 * 1000); // instante1 = ahora + x dias (un dia = 24 horas)
      dt2.setTime(dt2.getTime() + (req.bolsa.venceEn + 1) * 24 * 60 * 60 * 1000); // instante2 = ahora + (x + 1) dias
      Object.assign(where.fechaCaducidad, {[Op.gte]: dt1, [Op.lte]: dt2});
    }

    if(req.bolsa.estado !== undefined) { flag = true;
      if(req.bolsa.estado === 'vigente') {
        Object.assign(where.fechaCaducidad, {[Op.gt]: new Date()});
      } else { // vencido
        Object.assign(where.fechaCaducidad, {[Op.lt]: new Date()});
      }
    }
    
    if(!flag) delete where.fechaCaducidad;

    Bolsa.findAll({
      attributes: {exclude: ['cliente_id']},
      include: [{model: Cliente, as: 'cliente'}],
      where: where,
    }).then(bolsas => res.status(200).send(bolsas))
  },

};
