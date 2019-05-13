const express = require('express');
const clienteController = require('../controllers').clienteController;
const bolsaController = require('../controllers').bolsaController;
const conceptoController = require('../controllers').conceptoController;
const usoController = require('../controllers').usoController;
const puntoController = require('../controllers').puntoController;

const router = express.Router();

// Habilitar CORS
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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

router.get('/clientes',
  (req, res, next) => {console.log(`Listar clientes`); next();},
  clienteController.list
);

// asignar puntos (se genera una Bolsa)
router.post('/bolsas/',
  (req, res, next) => {console.log(`Generar una bolsa`); next();},
  clienteController.addPuntos
);

router.get('/bolsas/',
  (req, res, next) => {console.log(`Listar bolsas (para reporte)`); next();},
  bolsaController.procesarQueryParams, bolsaController.list
);

router.post('/usarPuntos',
  (req, res, next) => {console.log('Uso de puntos'); next();},
  usoController.validarUsarPuntos, usoController.usarPuntos,
);
//3. administracion de reglas
router.post('/puntos/reglas',
    (req, res, next) => {console.log('POST regla de puntos'); next();},
    puntoController.nuevaRegla
);
router.get('/puntos/reglas',
    (req, res, next) => {console.log('GET lista de reglas de asignacion de puntos'); next();},
    puntoController.listaReglas);
router.get('/puntos/reglas/:idRegla(\\d+)',
    (req, res, next) => {console.log('GET regla por idRegla'); next();},
    puntoController.getRegla);
router.put('/puntos/reglas/:idRegla(\\d+)',
    (req, res, next) => {console.log('PUT regla'); next();},
    puntoController.putRegla);
router.delete('/puntos/reglas/:idRegla(\\d+)',
    (req, res, next) => {console.log('DELETE regla'); next();},
    puntoController.deleteRegla);

//4. administracion de vencimiento de puntos
router.post('/puntos/vencimientos',
    (req, res, next) => {console.log('POST vencimiento de puntos'); next();},
    puntoController.nuevoVencimiento
);
router.get('/puntos/vencimientos',
    (req, res, next) => {console.log('GET lista vencimientos'); next();},
    puntoController.listaVencimiento);
router.get('/puntos/vencimientos/:idVencimiento(\\d+)',
    (req, res, next) => {console.log('GET vencimiento por idVencimiento'); next();},
    puntoController.getVencimiento);
router.put('/puntos/vencimientos/:idVencimiento(\\d+)',
    (req, res, next) => {console.log('PUT vencimiento'); next();},
    puntoController.putVencimiento);
router.delete('/puntos/vencimientos/:idVencimiento(\\d+)',
    (req, res, next) => {console.log('DELETE vencimiento'); next();},
    puntoController.deleteVencimiento);


//uso
router.get('/usos',
  (req, res, next) => {console.log(`Listar usos`); next();},
  usoController.getUso
);


//consultar puntos desde monto
router.get('/equivalenciaPuntos/:monto(\\d+)',
  (req, res, next) => {console.log(`Retornar equivalencia de puntos`); next();},
  clienteController.getPuntosDeMonto
);

module.exports = router;
