var express = require('express');
var router = express.Router();

const clienteController = require('../controllers').clienteController;
const bolsaController = require('../controllers').bolsaController;

router.get('/', function(req, res, next) {
  a = {};
  b = {a};
  a.a = 'welcome to the api';
  res.send(b.a.a);
});

router.get('/clientes', clienteController.list);

router.get('/clientes/bolsa', clienteController.deBolsa);

router.get('/bolsas/', bolsaController.procesarQueryParams, bolsaController.list);

module.exports = router;
