const express = require('express');
const router = express.Router();
const Regla = require('../models').Regla;
const Op = require('sequelize').Op;
const responder = require('./util').responder;


function validarRegla(req, res, next) {
  let limInferior = req.body.limInferior;
  let limSuperior = req.body.limSuperior;
  let equivalencia = req.body.equivalencia;
  if (typeof(limInferior) !== 'number' || !Number.isInteger(limInferior) || limInferior < 0) {
    responder(res.status(400), 1, 'especifique correctamente el límite inferior');
  } else if (typeof(limSuperior) !== 'number' || !Number.isInteger(limSuperior) ||
    limSuperior <= limInferior) {
    responder(res.status(400), 1, 'especifique correctamente el límite superior');
  } else if (typeof(equivalencia) !== 'number' || !Number.isInteger(equivalencia) || equivalencia <= 0) {
    responder(res.status(400), 1, 'especifique correctamente la equivalencia');
  } else { // CONTROLAR SOLAPAMIENTO
    let where = {};
    if (req.put) where.id = {[Op.ne]: req.params.id};
    where.limInferior = {[Op.lt]: req.body.limSuperior};
    where.limSuperior = {[Op.gt]: req.body.limInferior};
    Regla.findAll({where: where}).then(reglas => {
      if (reglas.length > 0) responder(res.status(400), 1, 'rango solapado');
      else next()
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    });
  }
}


router.post('/',
  // log de la operación
  (req, res, next) => {
    console.log('CREAR UNA REGLA');
    next();
  },

  validarRegla,

  // ejecutar la petición
  (req, res) => {
    Regla.create({
      limInferior: req.body.limInferior,
      limSuperior: req.body.limSuperior,
      equivalencia: req.body.equivalencia
    }).then((regla) => {
      console.log(regla);
      res.status(201).send(regla);
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    });
  },
);


router.get('/',
  // log de la operación
  (req, res,next) => {
    console.log('LISTAR TODAS LAS REGLAS');
    next();
  },
  
  // envía la respuesta
  (req, res) => {
    Regla.findAll({
      order: [['limInferior', 'ASC']]
    }).then((reglas) => {
      res.status(200).send(reglas);
    }).catch((reason) => {
      res.status(500).send();
      console.error(reason);
    });
  },
);


router.get('/:id(\\d+)',
  // log de la operación
  (req, res, next) => {
    console.log(`RETORNAR REGLA CON ID IGUAL A ${req.params.id}`);
    next();
  },

  // envía la respuesta
  (req, res) => {
    return Regla.findByPk(req.params.id).then(regla => {
      if (regla === null) {
        res.status(404).send();
      } else {
        res.status(200).send(regla);
      }
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    })
  },
);


router.put('/:id(\\d+)',
  // log de la operación
  (req, res, next) => {
    console.log(`MODIFICAR REGLA CON ID IGUAL A ${req.params.id}`);
    next();
  },

  // validar put
  (req, res, next) => {
    Regla.findByPk(req.params.id).then(regla => {
      if (regla === null) {
        return Promise.reject(new Error('404'));
      } else {
        req.put = true;
        if (req.body.limInferior === undefined) req.body.limInferior = regla.limInferior;
        if (req.body.limSuperior === undefined) req.body.limSuperior = regla.limSuperior;
        if (req.body.equivalencia === undefined) req.body.equivalencia = regla.equivalencia;
        return Promise.resolve();
      }
    }).then(() => {
      next();
    }).catch(reason => {
      if (reason.message === '404') {
        res.status(404).send();
      } else {
        res.status(500).send();
        console.error(reason);
      }
    });
  },

  validarRegla,

  // ejecutar la petición
  (req, res) => {
    return Regla.update({
      limInferior: req.body.limInferior,
      limSuperior: req.body.limSuperior,
      equivalencia: req.body.equivalencia,
    }, {
      where: {
        id: req.params.id,
      }
    }).then(() => {
      responder(res.status(200), 0, 'regla actualizada');
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    });
  },
);


router.delete('/:id(\\d+)',
  // log de la operación
  (req, res, next) => {
    console.log(`ELIMINAR REGLA CON ID IGUAL A ${req.params.id}`);
    next();
  },

  // elimina un regla en específico
  (req, res) => {
    Regla.findByPk(req.params.id).then(regla => {
      if (regla === null) {
        return Promise.reject(new Error('404'));
      } else {
        return regla.destroy();
      }
    }).then(() => {
      responder(res.status(200), 0, 'regla eliminada');
    }).catch((reason) => {
      if (reason.message === '404') {
        res.status(404).send();
      } else {
        res.status(500).send();
        console.error(reason);
      }
    });
  },
);


router.get('/equivalencia/',
  // log de la operación
  (req, res, next) => {
    console.log(`RETORNAR EQUIVALENCIA DE PUNTOS`);
    next();
  },

  // validar la peticion
  (req, res, next) => {
    let monto = req.query.monto;
    if (!Number.isInteger(Number.parseFloat(monto)) || parseInt(monto) < 0) {
      responder(res.status(400), 1, 'especifique correctamente el monto');
    } else {
      req.query.monto = parseInt(monto);
      next();
    }
  },

  // enviar la respuesta
  (req, res) => {
    return Regla.findAll({
      where: {
        limInferior: { [Op.lte]: req.query.monto },
        limSuperior: { [Op.gt]: req.query.monto },
      }
    }).then(reglas => {
      let puntosCalculados = Math.floor(req.query.monto / reglas[0].equivalencia);
      res.status(200).send({ puntos: puntosCalculados })
    }).catch(reason => {
      res.status(500).send();
      console.error(reason);
    });
  }
);


module.exports = router;
