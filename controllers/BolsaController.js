const express = require('express');
const router = express.Router();
const Regla = require('../models').Regla;
const Bolsa = require('../models').Bolsa;
const Cliente = require('../models').Cliente;
const Op = require('sequelize').Op;
const responder = require('./util').responder;


router.post('/',
  // log de la operación
  (req, res, next) => {
    console.log('CREAR BOLSA DE PUNTOS');
    next();
  },

  // validar creacion de bolsa
  (req, res, next) => {
    if (!Number.isInteger(req.body.monto) || req.body.monto <= 0) {
      responder(res.status(400), 1, 'especifique correctamente el monto');
    } else {
      Cliente.findByPk(req.body.clienteId).then(cliente => {
        if (cliente === null) {
          responder(res.status(400), 1, 'especifique correctamente el id del cliente');
        } else next();
      }).catch(reason => {
        res.status(500).send();
        console.error(reason);
      })
    }
  },

  // ejecutar la petición
  (req, res) => {
    Regla.findAll({
      where: {
        limInferior: { [Op.lte]: req.body.monto },
        limSuperior: { [Op.gt]: req.body.monto },
      }
    }).then(reglas => {
      let puntosCalculados = Math.floor(req.body.monto / reglas[0].equivalencia);
      let fechaVencimiento = new Date();
      fechaVencimiento.setDate((new Date()).getDate() + 365); // 365 debe ser cambiable
      // Asignar puntaje segun reglas
      return Bolsa.create({
        cliente_id: req.body.clienteId,
        fechaCaducidad: fechaVencimiento.toString(),
        asignado: puntosCalculados,
        saldo: puntosCalculados,
        montoOp: req.body.monto
      });
    }).then(bolsa => {
      res.status(201).send(bolsa);
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    });
  },
);


router.get('/',
  // log de la operación
  (req, res, next) => {
    console.log('LISTAR BOLSAS DE PUNTOS');
    next();
  },
  
  // validar query params
  (req, res, next) => {
    let venceEn = req.query.venceEn;
    if (venceEn !== undefined && Number.isNaN(parseFloat(venceEn))) {
      responder(res.status(400), 1, 'especifique correctamente en cuántos días es el vencimiento');
    } else if (req.query.estado !== undefined && !['vigente', 'vencido'].includes(req.query.estado)) {
      responder(res.status(400), 1, 'especifique correctamente el estado (debe ser vigente o vencido)');
    } else {
      req.query.venceEn = parseFloat(venceEn);
      next();
    }
  },

  // envía la lista de bolsas
  (req, res) => {
    const where = {};

    if (req.query.clienteId) {
      where.cliente_id = req.query.clienteId;
    }
    
    where.fechaCaducidad = {};
    let flag = false; // indica si hay que aplicar filtros para la fecha de caducidad

    if (req.query.venceEn !== undefined) {
      const dt = new Date();
      dt.setTime(dt.getTime() + req.query.venceEn * 24 * 60 * 60 * 1000);
      flag = true;
      Object.assign(
        where.fechaCaducidad,
        {[Op.lte]: dt}
      );
    }

    if (req.query.estado !== undefined) {
      if (req.query.estado === 'vigente') {
        flag = true;
        Object.assign(where.fechaCaducidad, {[Op.gt]: new Date()});
        where.saldo = {[Op.gt]: 0};
      } else { // vencido
        Object.assign(where, {
          [Op.or]: {
            fechaCaducidad: {[Op.lt]: new Date()},
            saldo: 0
          }
        });
      }
    }
    
    if (!flag) delete where.fechaCaducidad;

    Bolsa.findAll({
      attributes: {exclude: ['cliente_id']},
      include: [{model: Cliente, as: 'cliente'}],
      where: where,
    }).then(bolsas =>{
      res.status(200).send(bolsas)
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    })
  },
);


module.exports = router;
