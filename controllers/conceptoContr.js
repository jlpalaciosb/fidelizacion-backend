const Concepto = require('../models').Concepto;

module.exports = {
  /* validacion de los argumentos recibidos para crear un nuevo concepto */
  validarPost(req, res, next) {
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
  post(req, res) {
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

  /* listar todos los conceptos */
  list(req, res) {
    Concepto.findAll().then(conceptos => res.status(200).send(conceptos));
  },

  /* retornar un concepto en específico */
  get(req, res) {
    Concepto.findByPk(req.params.id).then(concepto => {
      if(concepto !== null) {
        res.status(200).send(concepto);
      } else {
        res.status(404).send();
      }
    });
  },

  /* validacion de los argumentos recibidos para actualizar un nuevo concepto */
  validarUpdate(req, res, next) {
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
  update(req, res) {
    Concepto.findByPk(req.params.id).then(concepto => {
      if(concepto === null) {
        res.status(404).send();
      } else {
        concepto.update({
          descripcion: req.body.descripcion,
          requerido: req.body.requerido,
        }).then(() => {
          res.status(200).send({msg: 'concepto actualizado'});
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

  /* elimina un concepto en específico */
  delete(req, res) {
    Concepto.findByPk(req.params.id).then(concepto => {
      if(concepto === null) {
        res.status(404).send();
      } else {
        return concepto.destroy();
      }
    }).then(() => {
      res.status(200).send({msg: `concepto con id igual a ${req.params.id} eliminado`});
    });
  }
};
