const express = require('express');
const router = express.Router();
const Premio = require('../models').Premio;


router.post('/',
  // log de la operación
  (req, res, next) => {
    console.log('CREAR UN PREMIO');
    next();
  },

  // validación de los argumentos recibidos para crear un nuevo premio
  (req, res, next) => {
    const descripcion = req.body.descripcion;
    const requerido = req.body.requerido;
    if(typeof(descripcion) !== 'string' || descripcion.trim() === '') {
      res.status(400).send({error: 'especifique (correctamente) la descripción'});
    } else if(typeof(requerido) !== 'number' || !Number.isInteger(requerido) || requerido <= 0) {
      res.status(400).send({error: 'especifique (correctamente) la cantidad requerida de puntos'});
    } else {
      req.body.descripcion = descripcion.trim();
      next();
    }
  },

  // crear el nuevo premio (ya validado) en la base de datos
  (req, res) => {
    Premio.create({
      descripcion: req.body.descripcion,
      requerido: req.body.requerido,
    }).then(premio => {
      res.status(201).send(premio);
    }).catch((reason) => {
      if(reason.name === 'SequelizeUniqueConstraintError') {
        res.status(400).send({error: 'ya existe otro premio con la misma descripción'});
      } else {
        res.status(500).send();
        console.log(reason);
      }
    });
  },
);


router.get('/',
  // log de la operación
  (req, res, next) => {
    console.log('LISTAR TODOS LOS PREMIOS');
    next();
  },

  // listar todos los premios
  (req, res) => {
    Premio.findAll().then(premios => {
      res.status(200).send(premios)
    }).catch(reason => {
      res.status(500).send();
      console.log(reason);
    });
  },
);


router.get('/:id(\\d+)',
  // log de la operación
  (req, res, next) => {
    console.log(`RETORNAR PREMIO CON ID IGUAL A ${req.params.id}`);
    next();
  },

  // enviar la respuesta
  (req, res) => {
    Premio.findByPk(req.params.id).then(premio => {
      if(premio !== null) {
        res.status(200).send(premio);
      } else {
        res.status(404).send();
      }
    }).catch(reason => {
      res.status(500).send();
      console.log(reason);
    });
  },
);


router.put('/:id(\\d+)',
  // log de la operación
  (req, res, next) => {
    console.log(`ACTUALIZAR PREMIO CON ID IGUAL A ${req.params.id}`);
    next();
  },

  // validación de los argumentos recibidos para modificar un premio
  (req, res, next) => {
    const descripcion = req.body.descripcion;
    const requerido = req.body.requerido;
    if(descripcion !== undefined &&
        (typeof(descripcion) !== 'string' || descripcion.trim() === '')) {
      res.status(400).send({error: 'especifique la descripcion correctamente'});
    } else if(requerido !== undefined &&
        (typeof(requerido) !== 'number' || !Number.isInteger(requerido) || requerido <= 0)) {
      res.status(400).send({error: 'especifique correctamente la cantidad requerida de puntos'});
    } else {
      if(descripcion !== undefined) req.body.descripcion = descripcion.trim();
      next();
    }
  },

  // actualiza un premio (ya validado)
  (req, res) => {
    Premio.findByPk(req.params.id).then(premio => {
      if (premio === null) {
        return Promise.reject(new Error('404'));
      } else {
        return premio.update({
          descripcion: req.body.descripcion,
          requerido: req.body.requerido,
        });
      }
    }).then(() => {
      res.status(200).send({success: 'premio actualizado'});
    }).catch((reason) => {
      if(reason.message === '404') {
        res.status(404).send();
      } else if(reason.name === 'SequelizeUniqueConstraintError') {
        res.status(400).send({error: 'ya existe otro premio con la misma descripción'});
      } else {
        res.status(500).send();
        console.log(error);
      }
    });
  },
);


router.delete('/:id(\\d+)',
  // log de la operación
  (req, res, next) => {
    console.log(`ELIMINAR PREMIO CON ID IGUAL A ${req.params.id}`);
    next();
  },

  // elimina un premio en específico
  (req, res) => {
    Premio.findByPk(req.params.id).then(premio => {
      if(premio === null) {
        return Promise.reject(new Error('404'));
      } else {
        return premio.destroy();
      }
    }).then(() => {
      res.status(200).send({success: 'premio eliminado'});
    }).catch((reason) => {
      if(reason.name === 'SequelizeForeignKeyConstraintError') {
        res.status(400).send({error: 'no se puede eliminar el premio porque es referenciado por un uso'});
      } else if(reason.message === '404') {
        res.status(404).send();
      } else {
        res.status(500).send();
        console.log(reason);
      }
    });
  },
);


module.exports = router;
