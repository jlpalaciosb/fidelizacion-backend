const express = require('express');
const clienteController = require('../controllers').clienteController;
const bolsaController = require('../controllers').bolsaController;
const conceptoController = require('../controllers').conceptoController;
const usoController = require('../controllers').usoController;

const router = express.Router();

router.get('/', function(req, res, next) {
  a = {};
  b = {a};
  a.a = 'welcome to the api';
  res.send(b.a.a);
});

router.post('/conceptos', 
  (req, res, next) => {console.log(`Crear un concepto`); next();},
  conceptoController.validarPost, conceptoController.post
);
router.get('/conceptos',
  (req, res, next) => {console.log(`Listar todos los conceptos`); next();},
  conceptoController.list
);
router.get('/conceptos/:id(\\d+)',
  (req, res, next) => {console.log(`Obtener concepto con id igual a ${req.params.id}`); next();},
  conceptoController.get
);
router.put('/conceptos/:id(\\d+)',
  (req, res, next) => {console.log(`Actualizar concepto con id igual a ${req.params.id}`); next();},
  conceptoController.validarUpdate, conceptoController.update
);
router.delete('/conceptos/:id(\\d+)',
  (req, res, next) => {console.log(`Eliminar concepto con id igual a ${req.params.id}`); next();},
  conceptoController.delete
);

router.get('/clientes', clienteController.list);

router.get('/clientes/bolsa', clienteController.deBolsa);

router.get('/bolsas/',
  (req, res, next) => {console.log(`Listar bolsas (para reporte)`); next();},
  bolsaController.procesarQueryParams, bolsaController.list
);

router.post('/usarPuntos',
  (req, res, next) => {console.log('Uso de puntos'); next();},
  usoController.validarUsarPuntos, usoController.usarPuntos,
);

module.exports = router;
