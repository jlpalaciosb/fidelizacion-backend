const Cliente = require('../models').Cliente;
const Bolsa = require('../models').Bolsa;
const Regla = require('../models').Regla;
const ParamDuracion = require('../models').ParamDuracion;
const Op = require('../models').Sequelize.Op;
const sequelize = require('../models').sequelize;

module.exports = {

    list(req, res) {
        Cliente.findAll()
            .then(
                (clientes) => {
                    res.status(200).send(clientes);
                }
            )
            .catch(
                (error) => {
                    res.status(400).send(error);
                }
            );
    },

    //servicio 8.a
    addPuntos(req, res) {
        return Regla.findAll(
            {
                where: {
                    [Op.and]: [{limInferior: {[Op.lte]: req.body.monto}}, {limSuperior: {[Op.gt]: req.body.monto}}]
                }
            }
        )
            .then(reglas => {
                var fechaAhora = new Date();

                //calcular fecha de caducidad de acuerdo a la fecha de asignacion
                var duracionDias= 0;
                ParamDuracion.findAll(
                    where = {
                        [Op.and]: [{ validez_ini: { [Op.lte]: fechaAhora } }, { validez_fin: { [Op.gte]: fechaAhora } }]
                    }
                )
                    .then(paramDuracion=>{
                        //calculo de puntos desde reglas
                        var puntosCalculados = Math.floor(req.body.monto / reglas[0].equivalencia);
                        //para vencimiento en puntaje en dias
                        var fechaVencimiento=new Date();
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

    //servicio 8.c
    getPuntosDeMonto(req, res) {
        return Regla.findAll(
            {
                where: {
                    [Op.and]: [{limInferior: {[Op.lte]: req.params.monto}}, {limSuperior: {[Op.gte]: req.params.monto}}]
                }
            }
        )
            .then(reglas => {
                var puntosCalculados = Math.floor(req.params.monto / reglas[0].equivalencia);
                res.status(200).send({puntos: puntosCalculados})
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('error del servidor');
            });
    }
};
