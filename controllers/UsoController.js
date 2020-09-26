const express = require('express');
const router = express.Router();
const Bolsa = require('../models').Bolsa;
const Premio = require('../models').Premio;
const Cliente = require('../models').Cliente;
const Uso = require('../models').Uso;
const UsoDetalle = require('../models').UsoDetalle;
const nodeMailer = require('nodemailer');
const sequelize = require('../models').sequelize;
const Op = require('sequelize').Op;


function enviarCorreo(destinatario, cantidad) {
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'fidelizacion.pwbii@gmail.com',
      pass: 'fidelizacion'
    }
  });
  let mailOptions = {
    to: destinatario,
    subject: 'Utilización de puntos',
    text: `Utilizaste ${cantidad} puntos.`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
}


router.get('/',
  // log de la operación
  (req, res, next) => {
    console.log('LISTAR USOS DE PUNTOS');
    next();
  },

  // envía la respuesta
  (req, res) => {
    let campos = [];
    if (req.query.clienteId)
      campos.push({ cliente_id: req.query.clienteId });
    if (req.query.premioId)
      campos.push({ premio_id: req.query.premioId });
    if (req.query.fechaInicio)
      campos.push({ fecha: { [Op.gte]: req.query.fechaInicio } });
    if (req.query.fechaFin)
      campos.push({ fecha: { [Op.lte]: req.query.fechaFin } });

    return Uso.findAll({
      attributes: ['id', 'utilizado', 'fecha'],
      include: [{ model: Cliente, as: 'cliente' }, { model: Premio, as: 'premio' },{ model: UsoDetalle, as: 'detalles' }],
      where: { [Op.and]: campos }
    }).then(usos => {
      res.status(200).send(usos)
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    });
  },
);


router.post('/',
  // log de la operación
  (req, res, next) => {
    console.log('USAR PUNTOS');
    next();
  },

  // valida el cliente y el premio y que el cliente tiene la cantidad necesaria de puntos
  (req, res, next) => {
    const clienteId = req.body.clienteId;
    const premioId = req.body.premioId;
    Cliente.findByPk(clienteId).then((cliente) => {
      if (cliente === null) {
        return Promise.reject({resultado: 2, mensaje: 'no existe cliente con el id recibido'});
      } else {
        req.cliente = cliente;
        return Premio.findByPk(premioId);
      }
    }).then((premio) => {
      if (premio === null) {
        return Promise.reject({resultado: 2, mensaje: 'no existe premio con el id recibido'});
      } else {
        req.premio = premio;
        return Bolsa.findAll({
          where: {
            cliente_id: clienteId,
            fechaCaducidad: { [Op.gt]: new Date() },
            saldo: { [Op.gt]: 0 },
          },
          order: [['fechaCaducidad', 'ASC'],],
        });
      }
    }).then((bolsas) => {
      let saldoTotal = 0;
      bolsas.forEach(bolsa => saldoTotal += bolsa.saldo);
      if (saldoTotal >= req.premio.requerido) {
        req.bolsas = bolsas;
        return Promise.resolve();
      } else {
        return Promise.reject({
          resultado: 1,
          mensaje: 'el cliente no tiene la cantidad requerida de puntos',
          saldoTotal: saldoTotal,
          requerido: req.premio.requerido,
        });
      }
    }).then(() => {
      next();
    }).catch(reason => {
      if (reason.resultado !== undefined) { // reason creado acá
        res.status(400).send(reason);
      } else {
        res.status(500).send();
        console.error(reason);
      }
    });
  },

  // ejecuta la petición
  (req, res) => {
    sequelize.transaction(t => {
      return Uso.create({
        utilizado: req.premio.requerido,
        fecha: new Date(),
        cliente_id: req.cliente.id,
        premio_id: req.premio.id,
      }, {
        transaction: t
      }).then((uso) => {
        req.usoDetalles = [];
        req.bolsasUsadas = [];
        let utilizar = req.premio.requerido;
        let bindex = 0;

        while(utilizar > 0) {
          let bolsa = req.bolsas[bindex];
          let usar = Math.min(utilizar, bolsa.saldo);
          req.usoDetalles.push(UsoDetalle.build({
            uso_id: uso.id,
            bolsa_id: bolsa.id,
            utilizado: usar,
          }));
          bolsa.utilizado += usar;
          bolsa.saldo -= usar;
          utilizar -= usar;
          bindex += 1;
          req.bolsasUsadas.push(bolsa);
        }

        let promesas = [];

        req.bolsasUsadas.forEach(bolsa => {
          promesas.push(bolsa.save({
            fields: ['utilizado', 'saldo'],
            transaction: t,
          }));
        });

        req.usoDetalles.forEach(usoDetalle => {
          promesas.push(usoDetalle.save({transaction: t}));
        });

        return Promise.all(promesas);
      });
    }).then(result => {
      res.status(200).send({
        resultado: 0,
        mensaje: 'puntos utilizados exitosamente',
      });
      enviarCorreo(req.cliente.email, req.premio.requerido);
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    });
  },
);


module.exports = router;
