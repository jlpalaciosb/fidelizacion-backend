const express = require('express');
const bolsaController = require('../controllers').bolsaController;
const clienteController = require('../controllers').clienteController;
const premioController = require('../controllers').premioController;
const reglaController = require('../controllers').reglaController;
const usoController = require('../controllers').usoController;

const router = express.Router();

// Habilitar CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/', (req, res) => {
  res.send('welcome to the api!');
});

router.use('/bolsas', bolsaController);
router.use('/clientes', clienteController);
router.use('/premios', premioController);
router.use('/reglas', reglaController);
router.use('/usos', usoController);

module.exports = router;
