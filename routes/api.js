var express = require('express');
var router = express.Router();
const clienteController = require('../controllers').clienteController

router.get('/', function(req, res, next) {
  res.send('welcome to the api')
});

router.get('/clientes', clienteController.list);

module.exports = router;
