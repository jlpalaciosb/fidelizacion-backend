const models = require('../models');
const Cliente = require('../models').Cliente;
const Concepto = require('../models').Concepto;
const Bolsa = require('../models').Bolsa;
const Uso = require('../models').Uso;
const UsoDetalle = require('../models').UsoDetalle;
const Op = require('sequelize').Op;

module.exports = {

    /* valida el cliente y el concepto y que el cliente tiene la cantidad necesaria de puntos */
    validarUsarPuntos(req, res, next) {
        const clienteId = req.body.clienteId;
        const conceptoId = req.body.conceptoId;
        if (typeof (clienteId) !== 'number' || typeof (conceptoId) !== 'number') { // tambien verifica que este definido
            res.status(400).send({error: 'especifique (correctamente) los ids del cliente y del concepto'});
        } else {
            Cliente.findByPk(clienteId).then((cliente) => {
                if (cliente === null) {
                    res.status(400).send({error: 'no existe cliente con el id recibido'});
                } else {
                    req.cliente = cliente;
                    return Concepto.findByPk(conceptoId);
                }
            }).then((concepto) => {
                if (concepto === null) {
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
                if (c < req.concepto.requerido) {
                    res.status(200).send({error: 'el cliente no tiene la cantidad requerida de puntos'});
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
        Uso.create({
            utilizado: concepto.requerido,
            fecha: new Date(),
            cliente_id: cliente.id,
            concepto_id: concepto.id,
        }).then((uso) => {
            const usoDetalles = [];
            const bolsasUsadas = [];
            var utilizar = concepto.requerido;
            var bindex = 0;
            while (utilizar > 0) {
                var bolsa = bolsas[bindex];
                var usar = Math.min(utilizar, bolsa.saldo);
                usoDetalles.push(UsoDetalle.build({
                    uso_id: uso.id,
                    bolsa_id: bolsa.id,
                    utilizado: usar,
                }));
                bolsa.utilizado += usar;
                bolsa.saldo -= usar;
                utilizar -= usar;
                bindex += 1;
                bolsasUsadas.push(bolsa);
            }
            bolsasUsadas.forEach(bolsa => bolsa.save({fields: ['utilizado', 'saldo']})); // then? bulk save?
            usoDetalles.forEach(usoDetalle => usoDetalle.save()); // then? bulk create?
            res.status(200).send({success: 'puntos utilizados exitosamente'});
        });
    },

    getUso(req, res) {
        var campos = [];
        if (req.query.idCliente)
            campos.push({cliente_id: req.query.idCliente});
        if (req.query.idConcepto)
            campos.push({concepto_id: req.query.idConcepto});
        if (req.query.fechaInicio && req.query.fechaFin) {
            campos.push({fecha: {[models.Sequelize.Op.gte]: req.query.fechaInicio}});
            campos.push({fecha: {[models.Sequelize.Op.lte]: req.query.fechaFin}});

        }

        return models.Uso.findAll({
            attributes: ['id', 'utilizado', 'fecha'],
            include: [{model: models.Cliente, as: 'cliente'}, {model: models.Concepto, as: 'concepto'}],
            where: {[models.Sequelize.Op.and]: campos}
        })
            .then(usos => res.status(200).send(usos))
            .catch(error => {
                console.log(error);
                res.status(500).send('error del servidor');
            });
    },

}
;
