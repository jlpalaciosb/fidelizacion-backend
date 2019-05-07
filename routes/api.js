const express = require('express');
const clienteController = require('../controllers').clienteController;
const bolsaController = require('../controllers').bolsaController;
const conceptoController = require('../controllers').conceptoController;
const usoController = require('../controllers').usoController;
const puntoController = require('../controllers').puntoController;

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

// asignar puntos (se genera una Bolsa)
router.post('/bolsas/', clienteController.addPuntos);

router.get('/bolsas/',
  (req, res, next) => {console.log(`Listar bolsas (para reporte)`); next();},
  bolsaController.procesarQueryParams, bolsaController.list
);

router.post('/usarPuntos',
  (req, res, next) => {console.log('Uso de puntos'); next();},
  usoController.validarUsarPuntos, usoController.usarPuntos,
);
//administracion de vencimiento de puntos
router.post('/punto/vencimiento',
    (req, res, next) => {console.log('Nuevo vencimiento de puntos'); next();},
    puntoController.nuevoVencimiento
);
//uso
router.get('/usos', usoController.getUso);


//consultar puntos desde monto
router.get('/equivalenciaPuntos/:monto', clienteController.getPuntosDeMonto);
module.exports = router;
