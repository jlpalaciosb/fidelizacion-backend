const Cliente = require('../models').Cliente;
const Bolsa = require('../models').Bolsa;
const Regla= require('../models').Regla;
const Op= require('../models').Sequelize.Op;
const sequelize= require('../models').sequelize;
module.exports = {
  list(req, res) {
    return Cliente.findAll()
      .then(
        (clientes) => {
          res.status(200).send(clientes[0]);
        }
      )
      .catch(
        (error) => {
          res.status(400).send(error);
        }
      );
  },
  deBolsa(req, res) {
    return Bolsa.findAll()
      .then(bolsas => Cliente.findByPk(bolsas[0].cliente_id))
      .then(cliente => res.status(200).send(cliente))
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  },
    //servicio 8.a
    addPuntos(req,res){
        return Regla.findAll(
            {
                where:{
                    [Op.and]:[{limInferior:{[Op.lte]:req.params.monto}},{limSuperior:{[Op.gte]:req.params.monto}}]
                }
            }

        )
            .then(reglas => {
                var puntosCalculados=0;
                var fechaAhora = new Date();
                //para vencimiento en 30 dias
                fechaAhora.setDate(fechaAhora.getDate() + 30);

                reglas.forEach( function(valor, indice, array) {

                    puntosCalculados = puntosCalculados+ Math.floor(req.params.monto / valor.equivalencia);


                });
                // Asignar puntaje segun reglas
                return Bolsa.create(
                    {
                        cliente_id:req.params.idCliente,
                        fechaCaducidad: fechaAhora.toString(),
                        asignado: puntosCalculados,
                        saldo:puntosCalculados,
                        montoOp: 0
                    }
                )
                    .then( (bolsa)=> res.status(201).send(bolsa))
                    .catch((error)=> res.status(500).send(error))
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('error del servidor');
            });
    },
    //servicio 8.c
    getPuntosDeMonto(req,res){
        return Regla.findAll(
            {
                where:{
                    [Op.and]:[{limInferior:{[Op.lte]:req.params.monto}},{limSuperior:{[Op.gte]:req.params.monto}}]
                }
            }

        )
            .then(reglas =>{
                var puntosCalculados=0;
                reglas.forEach( function(valor, indice, array) {

                    puntosCalculados = puntosCalculados+ Math.floor(req.params.monto / valor.equivalencia);


                });
                res.status(200).send({puntos:puntosCalculados})
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('error del servidor');
            });
    }
};
