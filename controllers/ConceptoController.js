const express = require('express');
const router = express.router();
const Concepto = require('../models').Concepto;

router.post(
  '',
  (req, res, next) => {
    console.log(`Crear un concepto`);
    next();
  },
  /* validacion de los argumentos recibidos para crear un nuevo concepto */
  (req, res, next) => {
    const descripcion = req.body.descripcion;
    const requerido = req.body.requerido;
    if(typeof(descripcion) !== 'string' || descripcion.trim() === '') {
      res.status(400).send({error: 'especifique (correctamente) la descripción'});
    } else if(typeof(requerido) !== 'number' || parseInt(requerido) <= 0) {
      res.status(400).send({error: 'especifique (correctamente) la cantidad requerida de puntos'});
    } else {
      req.body.descripcion = descripcion.trim();
      req.body.requerido = parseInt(requerido);
      next();
    }
  },
  /* crear el nuevo concepto (ya validado) en la base de datos */
  (req, res) => {
    Concepto.create({
      descripcion: req.body.descripcion,
      requerido: req.body.requerido,
    }).then(concepto => {
      res.status(201).send(concepto);
    }).catch((error) => {
      if(error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).send({error: 'ya existe otro concepto con la misma descripción'});
      } else {
        console.log(error);
      }
    });
  },
);

router.get(
  '',
  (req, res, next) => {
    console.log(`Listar todos los conceptos`);
    next();
  },
  /* listar todos los conceptos */
  (req, res) => {
    Concepto.findAll().then(conceptos => res.status(200).send(conceptos));
  },
);

router.get(
  '(:id)\\d+',
  (req, res, next) => {
    console.log(`Obtener concepto con id igual a ${req.params.id}`);
    next();
  },
  /* retornar un concepto en específico */
  (req, res) => {
    Concepto.findByPk(req.params.id).then(concepto => {
      if(concepto !== null) {
        res.status(200).send(concepto);
      } else {
        res.status(404).send();
      }
    });
  },
);

router.put(
  '(:id)\\d+',
  (req, res, next) => {
    console.log(`Actualizar concepto con id igual a ${req.params.id}`);
    next();
  },
  /* validacion de los argumentos recibidos para actualizar un nuevo concepto */
  (req, res, next) => {
    const descripcion = req.body.descripcion;
    const requerido = req.body.requerido;
    if(descripcion !== undefined && typeof(descripcion) !== 'string') {
      res.status(400).send({error: 'especifique la descripcion correctamente'});
    } else if(typeof(descripcion) === 'string' && descripcion.trim() === '') {
      res.status(400).send({error: 'especifique la descripcion correctamente'});
    } else if(requerido !== undefined && typeof(requerido) !== 'number') {
      res.status(400).send({error: 'especifique correctamente la cantidad requerida de puntos'});
    } else if(requerido !== undefined && parseInt(requerido) <= 0) {
      res.status(400).send({error: 'especifique correctamente la cantidad requerida de puntos'});
    } else {
      if(descripcion !== undefined) req.body.descripcion = descripcion.trim();
      if(requerido !== undefined) req.body.requerido = parseInt(requerido);
      next();
    }
  },
  /* actualiza un concepto (ya validado) */
  (req, res) => {
    Concepto.findByPk(req.params.id).then(concepto => {
      if(concepto === null) {
        res.status(404).send();
      } else {
        concepto.update({
          descripcion: req.body.descripcion,
          requerido: req.body.requerido,
        }).then(() => {
          res.status(200).send({success: 'concepto actualizado'});
        }).catch((error) => {
          if(error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).send({error: 'ya existe otro concepto con la misma descripción'});
          } else {
            console.log(error);
          }
        });
      }
    });
  },
);

router.delete(
  '(:id)\\d+',
  (req, res, next) => {
    console.log(`Eliminar concepto con id igual a ${req.params.id}`);
    next();
  },
  /* elimina un concepto en específico */
  (req, res) => {
    Concepto.findByPk(req.params.id).then(concepto => {
      if(concepto === null) {
        res.status(404).send();
      } else {
        return concepto.destroy();
      }
    }).then(() => {
      res.status(200).send({success: `concepto eliminado`});
    }).catch((error) => {
      if(error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(400).send({error: 'no se puede eliminar el concepto porque es referenciado por un uso'});
      } else {
        console.log(error);
      }
    });
  },
);

module.exports = router;
