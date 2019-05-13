const models = require('../models');
const Cliente = require('../models').Cliente;
const Concepto = require('../models').Concepto;
const Bolsa = require('../models').Bolsa;
const Uso = require('../models').Uso;
const UsoDetalle = require('../models').UsoDetalle;
const Op = require('sequelize').Op;
const nodeMailer = require('nodemailer');
const sequelize = require('../models').sequelize;

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

module.exports = {
  /* valida el cliente y el concepto y que el cliente tiene la cantidad necesaria de puntos */
  validarUsarPuntos(req, res, next) {
    const clienteId = req.body.clienteId;
    const conceptoId = req.body.conceptoId;
    if (typeof (clienteId) !== 'number' || typeof (conceptoId) !== 'number') { // tambien verifica que este definido
      res.status(400).send({ error: 'especifique (correctamente) los ids del cliente y del concepto' });
    } else {
      Cliente.findByPk(clienteId).then((cliente) => {
        if (cliente === null) {
          res.status(400).send({ error: 'no existe cliente con el id recibido' });
        } else {
          req.cliente = cliente;
          return Concepto.findByPk(conceptoId);
        }
      }).then((concepto) => {
        if (concepto === null) {
          res.status(400).send({ error: 'no existe concepto con el id recibido' });
        } else {
          req.concepto = concepto;
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
        let c = 0;
        bolsas.forEach(bolsa => c += bolsa.saldo);
        if (c < req.concepto.requerido) {
          res.status(200).send({ error: 'el cliente no tiene la cantidad requerida de puntos' });
        } else {
          req.bolsas = bolsas;
          next();
        }
      });
    }
  },

  /* usa los puntos (una vez validado) */
  usarPuntos(req, res) {
    sequelize.transaction(t => {

      return Uso.create(
        {
          utilizado: req.concepto.requerido,
          fecha: new Date(),
          cliente_id: req.cliente.id,
          concepto_id: req.concepto.id,
        }, {transaction: t}
      ).then((uso) => {
        req.usoDetalles = [];
        req.bolsasUsadas = [];
        let utilizar = req.concepto.requerido;
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
      res.status(200).send({success: 'puntos utilizados exitosamente'});
      enviarCorreo(req.cliente.email, req.concepto.requerido);
    }).catch(error => {
      console.log(error);
    });
  },

  getUso(req, res) {
    let where = {

    };
    if (req.query.idCliente) {
      where = { cliente_id: req.query.idCliente }
    } else {
      if (req.query.idConcepto) {
        where = { concepto_id: req.query.idConcepto }
      } else {
        if (req.query.fechaInicio && req.query.fechaFin) {
          where = {
            [models.Sequelize.Op.and]: [{ fecha: { [models.Sequelize.Op.gte]: req.query.fechaInicio } }, { fecha: { [models.Sequelize.Op.lte]: req.query.fechaFin } }]
          }
        }
      }
    }

    return models.Uso.findAll({
      attributes: ['id', 'utilizado', 'fecha'],
      include: [{ model: models.Cliente, as: 'cliente' }, { model: models.Concepto, as: 'concepto' }],
      where: where
    })
      .then(usos => res.status(200).send(usos))
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  },
};
