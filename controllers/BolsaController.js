const express = require('express');
const router = express.router();
const models = require('../models');

// asignar puntos (se genera una Bolsa)
router.post(
  '',
  (req, res, next) => {
    console.log(`Generar una bolsa`); 
    next();
  },
  //servicio 8.a
  (req, res) => {
    return Regla.findAll(
      {
        where: {
          [Op.and]: [{ limInferior: { [Op.lte]: req.body.monto } }, { limSuperior: { [Op.gt]: req.body.monto } }]
        }
      }
    )
      .then(reglas => {
        var fechaAhora = new Date();

        //calcular fecha de caducidad de acuerdo a la fecha de asignacion
        var duracionDias = 0;
        ParamDuracion.findAll(
          where = {
            [Op.and]: [{ validez_ini: { [Op.lte]: fechaAhora } }, { validez_fin: { [Op.gte]: fechaAhora } }]
          }
        )
          .then(paramDuracion => {
            //calculo de puntos desde reglas
            var puntosCalculados = Math.floor(req.body.monto / reglas[0].equivalencia);
            //para vencimiento en puntaje en dias
            var fechaVencimiento = new Date();
            fechaVencimiento.setDate(fechaAhora.getDate() + paramDuracion[0].duracion);
            // Asignar puntaje segun reglas
            return Bolsa.create(
              {
                cliente_id: req.body.idCliente,
                fechaCaducidad: fechaVencimiento.toString(),
                asignado: puntosCalculados,
                saldo: puntosCalculados,
                montoOp: req.body.monto
              }
            )
              .then((bolsa) => res.status(201).send(bolsa))
              .catch((error) => res.status(500).send(error))
          })

      })
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  },
);

router.get(
  '',
  (req, res, next) => {
    console.log(`Listar bolsas (para reporte)`);
    next();
  },
  
  /* middleware para procesar los query params para la lista de bolsas */
  (req, res, next) => {
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
  (req, res) => {
    const where = {};

    if(req.bolsa.clienteId !== undefined) {
      where.cliente_id = req.bolsa.clienteId;
    }
    
    where.fechaCaducidad = {};
    var flag = false; // indica si hay que aplicar filtros para la fecha de caducidad

    if(req.bolsa.venceEn !== undefined) {
      flag = true;
      const dt1 = new Date(); const dt2 = new Date();
      dt1.setTime(dt1.getTime() + (req.bolsa.venceEn - 1) * 24 * 60 * 60 * 1000); // instante1 = ahora + x dias (un dia = 24 horas)
      dt2.setTime(dt2.getTime() + (req.bolsa.venceEn + 1) * 24 * 60 * 60 * 1000); // instante2 = ahora + (x + 1) dias
      Object.assign(where.fechaCaducidad, {[Op.gte]: dt1, [Op.lte]: dt2});
    }

    if(req.bolsa.estado !== undefined) {
      if(req.bolsa.estado === 'vigente') {
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
    
    if(!flag) delete where.fechaCaducidad;

    Bolsa.findAll({
      attributes: {exclude: ['cliente_id']},
      include: [{model: Cliente, as: 'cliente'}],
      where: where,
    }).then(bolsas => res.status(200).send(bolsas))
  },
);

module.exports = router;
