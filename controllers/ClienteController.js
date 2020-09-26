const express = require('express');
const router = express.router();
const Cliente = require('../models').Cliente;

router.get(
  '',
  (req, res, next) => {
    console.log('retornar lista de todos los clientes');
    next();
  },
  (req, res) => {
    Cliente.findAll({
      order: [['apellido', 'ASC'], ['nombre', 'ASC']],
    }).then((clientes) => {
      res.status(200).send(clientes);
    }).catch((error) => {
      console.log(error);
      res.status(500).send();
    });
  },
);

module.exports = router;
