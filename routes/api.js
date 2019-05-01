const express = require('express');
const clienteController = require('../controllers').clienteController;
const bolsaController = require('../controllers').bolsaController;
const conceptoController = require('../controllers').conceptoController;

const router = express.Router();

router.get('/', function(req, res, next) {
  a = {};
  b = {a};
  a.a = 'welcome to the api';
  res.send(b.a.a);
});

router.post('/conceptos', conceptoController.validarPost, conceptoController.post);

router.get('/clientes', clienteController.list);

router.get('/clientes/bolsa', clienteController.deBolsa);

router.get('/bolsas/', bolsaController.procesarQueryParams, bolsaController.list);

module.exports = router;
