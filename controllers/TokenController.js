const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models').Usuario;
const fs = require('fs');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/',
  // log de la operación
  (req, res, next) => {
    console.log('GENERAR TOKEN');
    next();
  },

  // validar (login)
  (req, res, next) => {
    if (typeof(req.body.nombreDeUsuario) + typeof(req.body.contrasenha) !== 'stringstring') {
      res.status(400).send();
    } else {
      Usuario.findOne({
        where: {nombreDeUsuario: req.body.nombreDeUsuario},
        attributes: ['contrasenhaHash'],
      }).then(usuario => {
        if (usuario === null) {
          return Promise.reject(403);
        } else {
          return bcrypt.compare(req.body.contrasenha, usuario.contrasenhaHash);
        }
      }).then(cmpRes => {
        if (cmpRes === true) {
          next();
        } else {
          res.status(403).send();
        }
      }).catch(reason => {
        if (reason === 403) {
          res.status(403).send();
        } else {
          res.status(500).send();
          console.error(reason);
        }
      });
    }
  },

  // generar el token
  (req, res) => {
    let privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64');
    jwt.sign(
      {permisos: 'todos'}, privateKey,
      {expiresIn: '10 days', algorithm: 'RS256'},
      (err, token) => {
        if (err === null) {
          res.status(200).send({token: token});
        } else {
          res.status(500).send({
            resultado: 1,
            mensaje: 'error en el servidor al generar token'
          });
          console.error(err);
        }
      }
    );
  }
);

module.exports = router;
