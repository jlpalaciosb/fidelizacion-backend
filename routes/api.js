var express = require('express');
var router = express.Router();

const clienteController = require('../controllers').clienteController;
const bolsaController = require('../controllers').bolsaController;
const usoController= require('../controllers').usoController;

router.get('/', function(req, res, next) {
  a = {};
  b = {a};
  a.a = 'welcome to the api';
  res.send(b.a.a);
});

router.get('/clientes', clienteController.list);
router.post('/clientes', clienteController.addCliente);
router.put('/clientes/:idCliente', clienteController.putCliente);

//asignar puntos
router.post('/clientes/:idCliente/', clienteController.addPuntos);

router.get('/clientes/bolsa', clienteController.deBolsa);

router.get('/bolsa', bolsaController.list);

//uso
router.get('/uso', usoController.getUso);


//consultar puntos desde monto
router.get('/puntos/monto/:monto', clienteController.getPuntosDeMonto);
module.exports = router;
