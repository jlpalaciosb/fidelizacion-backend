const express = require('express');
const router = express.Router();
const Cliente = require('../models').Cliente;


router.get('/',
  // log de la operación
  (req, res, next) => {
    console.log('LISTAR TODOS LOS CLIENTES');
    next();
  },

  // envía la respuesta
  (req, res) => {
    Cliente.findAll({
      order: [['apellido', 'ASC'], ['nombre', 'ASC']],
    }).then((clientes) => {
      res.status(200).send(clientes);
    }).catch((reason) => {
      res.status(500).send();
      console.error(reason);
    });
  },
);


module.exports = router;
