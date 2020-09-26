const express = require('express');
const tokenController = require('../controllers').TokenController;
const bolsaController = require('../controllers').BolsaController;
const clienteController = require('../controllers').ClienteController;
const premioController = require('../controllers').PremioController;
const reglaController = require('../controllers').ReglaController;
const usoController = require('../controllers').UsoController;
const fs = require('fs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Habilitar CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Autenticar con JWT
router.use((req, res, next) => {
  if (req.originalUrl === '/api/token') { next(); return; }

  let publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64');
  let token;
  if (req.headers.authorization) token = req.headers.authorization.split(' ')[1];
  jwt.verify(
    token, publicKey, { algorithm: ["RS256"] },
    (err, payload) => {
      if (err === null) {
        if (payload.permisos === 'todos') {
          next();
        } else {
          res.status(403).send({mensaje: 'no tiene permiso'});
        }
      } else if (err.name === 'TokenExpiredError') {
        res.status(403).send({mensaje: 'token expirado'});
      } else {
        res.status(403).send({mensaje: 'error de token'});
      }
    }
  );
});

router.get('/', (req, res) => {
  res.send('welcome to the api!');
});

router.use('/token', tokenController);
router.use('/bolsas', bolsaController);
router.use('/clientes', clienteController);
router.use('/premios', premioController);
router.use('/reglas', reglaController);
router.use('/usos', usoController);

module.exports = router;
