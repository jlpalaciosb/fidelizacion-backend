const express = require('express');
const router = express.Router();
const models = require('../models');
const nodeMailer = require('nodemailer');


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
  (req, res, next) => {
    console.log(`Listar usos`); 
    next();
  },
  (req, res) => {
    var campos = [];
    if (req.query.idCliente)
      campos.push({ cliente_id: req.query.idCliente });
    if (req.query.idPremio)
      campos.push({ premio_id: req.query.idPremio });
    if (req.query.fechaInicio && req.query.fechaFin) {
      campos.push({ fecha: { [models.Sequelize.Op.gte]: req.query.fechaInicio } });
      campos.push({ fecha: { [models.Sequelize.Op.lte]: req.query.fechaFin } });

    }

    return models.Uso.findAll({
      attributes: ['id', 'utilizado', 'fecha'],
      include: [{ model: models.Cliente, as: 'cliente' }, { model: models.Premio, as: 'premio' },{ model: models.UsoDetalle, as: 'detalles' }],
      where: { [models.Sequelize.Op.and]: campos }
    })
      .then(usos => res.status(200).send(usos))
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  },
);


router.post('/usar',
  (req, res, next) => {
    console.log('Uso de puntos');
    next();
  },
  /* valida el cliente y el premio y que el cliente tiene la cantidad necesaria de puntos */
  (req, res, next) => {
    const clienteId = req.body.clienteId;
    const premioId = req.body.premioId;
    if (typeof (clienteId) !== 'number' || typeof (premioId) !== 'number') { // tambien verifica que este definido
      res.status(400).send({ error: 'especifique (correctamente) los ids del cliente y del premio' });
    } else {
      Cliente.findByPk(clienteId).then((cliente) => {
        if (cliente === null) {
          res.status(400).send({ error: 'no existe cliente con el id recibido' });
        } else {
          req.cliente = cliente;
          return Premio.findByPk(premioId);
        }
      }).then((premio) => {
        if (premio === null) {
          res.status(400).send({ error: 'no existe premio con el id recibido' });
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
        if (saldoTotal < req.premio.requerido) {
          res.status(200).send({
            resultado: 1,
            mensaje: 'El cliente no tiene la cantidad requerida de puntos.',
            saldoTotal: saldoTotal,
            requerido: req.premio.requerido,
          });
        } else {
          req.bolsas = bolsas;
          next();
        }
      });
    }
  },

  /* usa los puntos (una vez validado) */
  (req, res) => {
    sequelize.transaction(t => {

      return Uso.create(
        {
          utilizado: req.premio.requerido,
          fecha: new Date(),
          cliente_id: req.cliente.id,
          premio_id: req.premio.id,
        }, {transaction: t}
      ).then((uso) => {
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

        promesas = [];

        req.bolsasUsadas.forEach(bolsa => {
          promesas.push(
            bolsa.save({
              fields: ['utilizado', 'saldo'],
              transaction: t,
            })
          );
        });

        req.usoDetalles.forEach(usoDetalle => {
          promesas.push(
            usoDetalle.save({transaction: t})
          );
        });

        return Promise.all(promesas);
      });
    }).then(result => {
      res.status(200).send({
        resultado: 0,
        mensaje: 'Puntos utilizados exitosamente.',
      });
      enviarCorreo(req.cliente.email, req.premio.requerido);
    }).catch(error => {
      console.log(error);
    });
  },

);

module.exports = router;
