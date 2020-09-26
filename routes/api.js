const express = require('express');
const bolsaController = require('../controllers').BolsaController;
const clienteController = require('../controllers').ClienteController;
const premioController = require('../controllers').PremioController;
const reglaController = require('../controllers').ReglaController;
const usoController = require('../controllers').UsoController;

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
