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
      Concepto.count({
        where: {descripcion: descripcion.trim()}
      }).then(c => {
        if(c == 0) {
          req.body.descripcion = descripcion.trim();
          req.body.requerido = parseInt(requerido);
          next();
        } else {
          res.status(400).send({error: 'ya existe otro concepto con esa misma descripción'});
        }
      });
    }
  },

  /* crear el nuevo concepto (ya validado) en la base de datos */
  post(req, res) {
    Concepto.create({
      descripcion: req.body.descripcion,
      requerido: req.body.requerido,
    }).then(concepto => {
      res.status(201).send(concepto);
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
};
