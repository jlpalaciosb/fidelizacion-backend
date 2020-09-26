const express = require('express');
const router = express.Router();
const Premio = require('../models').Premio;


router.post('/',
  (req, res, next) => {
    console.log(`Crear un premio`);
    next();
  },
  /* validacion de los argumentos recibidos para crear un nuevo premio */
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
  /* crear el nuevo premio (ya validado) en la base de datos */
  (req, res) => {
    Premio.create({
      descripcion: req.body.descripcion,
      requerido: req.body.requerido,
    }).then(premio => {
      res.status(201).send(premio);
    }).catch((error) => {
      if(error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).send({error: 'ya existe otro premio con la misma descripción'});
      } else {
        console.log(error);
      }
    });
  },
);


router.get('/',
  (req, res, next) => {
    console.log(`Listar todos los premios`);
    next();
  },
  /* listar todos los premios */
  (req, res) => {
    Premio.findAll().then(premios => res.status(200).send(premios));
  },
);


router.get('/:id(\\d+)',
  (req, res, next) => {
    console.log(`Obtener premio con id igual a ${req.params.id}`);
    next();
  },
  /* retornar un premio en específico */
  (req, res) => {
    Premio.findByPk(req.params.id).then(premio => {
      if(premio !== null) {
        res.status(200).send(premio);
      } else {
        res.status(404).send();
      }
    });
  },
);


router.put('/:id(\\d+)',
  (req, res, next) => {
    console.log(`Actualizar premio con id igual a ${req.params.id}`);
    next();
  },
  /* validacion de los argumentos recibidos para actualizar un nuevo premio */
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
  /* actualiza un premio (ya validado) */
  (req, res) => {
    Premio.findByPk(req.params.id).then(premio => {
      if(premio === null) {
        res.status(404).send();
      } else {
        premio.update({
          descripcion: req.body.descripcion,
          requerido: req.body.requerido,
        }).then(() => {
          res.status(200).send({success: 'premio actualizado'});
        }).catch((error) => {
          if(error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).send({error: 'ya existe otro premio con la misma descripción'});
          } else {
            console.log(error);
          }
        });
      }
    });
  },
);


router.delete('/:id(\\d+)',
  (req, res, next) => {
    console.log(`Eliminar premio con id igual a ${req.params.id}`);
    next();
  },

  /* elimina un premio en específico */
  (req, res) => {
    Premio.findByPk(req.params.id).then(premio => {
      if(premio === null) {
        res.status(404).send();
        return Promise.reject(new Error('404'));
      } else {
        return premio.destroy();
      }
    }).then(() => {
      res.status(200).send({success: `premio eliminado`});
    }).catch((error) => {
      if(error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(400).send({error: 'no se puede eliminar el premio porque es referenciado por un uso'});
      } else if(error.message === '404') {
        // do nothing
      } else {
        console.log(error);
      }
    });
  },
);


module.exports = router;
