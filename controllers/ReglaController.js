const express = require('express');
const router = express.Router();
const models = require('../models');
const Regla = models.Regla;
const Op = require('sequelize').Op;


router.get('/',
  (req, res, next) => {
    console.log('GET lista de reglas de asignacion de puntos');
    next();
  },
  (req, res) => {
    models.Regla.findAll()
    .then(
      (reglas) => {
        res.status(200).send(reglas);
      }
    )
    .catch(
      (error) => {
        res.status(500).send({ error: "Error al obtener lista de reglas" });
      }
    );
  },
);


router.get('/:idRegla(\\d+)',
  (req, res, next) => {
    console.log('GET regla por idRegla');
    next();
  },
  (req, res) => {
    return models.Regla.findByPk(req.params.idRegla)
      .then(regla => res.status(200).send(regla))
      .catch(error => res.status(500).send({ error: "Error al obtener regla" }))
  },
);


function validarPost(req, res, next) {
  if(req.body.limInferior >= req.body.limSuperior) {
    res.status(200).send({error: 'Rango invalido'});
  } else {
    var where = {};
    if(req.put) {
      where.id = {[Op.ne]: req.params.idRegla};
    }
    where.limInferior = {[Op.lt]: req.body.limSuperior};
    where.limSuperior = {[Op.gt]: req.body.limInferior};
    models.Regla.findAll(
        {
          where: where
        }
    )
        .then(reglas => {
          if (reglas.length > 0)
            res.status(200).send({error: 'Existe regla que se solapa con el rango especificado'});
          else
            next()
        })
        .catch(error => {
          console.log(error);
          res.status(500).send('error del servidor');
        });
  }
}


router.put('/:idRegla(\\d+)',
  (req, res, next) => {
    console.log('PUT regla');
    next();
  },
  // validar put
  (req, res, next) => {
    models.Regla.findByPk(req.params.idRegla).then(regla => {
      req.put = true;
      if(req.body.limInferior === undefined) req.body.limInferior = regla.limInferior;
      if(req.body.limSuperior === undefined) req.body.limSuperior = regla.limSuperior;
      next();
    }).catch(reason => res.status(404).send());
  },
  validarPost,
  (req, res) => {
    return models.Regla.update({
      limInferior: req.body.limInferior,
      limSuperior: req.body.limSuperior,
      equivalencia: req.body.equivalencia
    },
      {
        where: {
          id: req.params.idRegla
        }
      }).then((regla) => {
        res.status(201).send({ success: 'Regla de asignacion de puntos actualizada correctamente.' });
      })
      .catch(error => res.status(500).send({ error: "Error al actualizar Regla de asignacion de puntos" }));
  },
);


router.post('/',
  (req, res, next) => {
    console.log('POST regla de puntos');
    next();
  },
  validarPost,
  (req, res) => {
    return models.Regla.create({
      limInferior: req.body.limInferior,
      limSuperior: req.body.limSuperior,
      equivalencia: req.body.equivalencia
    }).then((regla) => {
      res.status(201).send({ success: 'Regla de asignacion de puntos creada exitosamente.' });
    })
      .catch(error => res.status(500).send({ error: "Error al crear regla de asignacion de puntos" }));
  },
);


router.delete('/:idRegla(\\d+)',
  (req, res, next) => {
    console.log('DELETE regla');
    next();
  },
  (req, res) => {
    return models.Regla.destroy({
      where: {
        id: req.params.idRegla
      }
    })
      .then(regla => {
        res.status(200).end();
      })
      .catch(
        (error) => res.status(400).send({ error: "Error al intentar eliminar Regla de asignacion de puntos" }));
  },
);


//consultar puntos desde monto
router.get('/equivalencia/:monto(\\d+)',
  (req, res, next) => {
    console.log(`Retornar equivalencia de puntos`); 
    next();
  },
  //servicio 8.c
  (req, res) => {
    return Regla.findAll(
      {
        where: {
          [Op.and]: [{ limInferior: { [Op.lte]: req.params.monto } }, { limSuperior: { [Op.gt]: req.params.monto } }]
        }
      }
    )
      .then(reglas => {
        var puntosCalculados = Math.floor(req.params.monto / reglas[0].equivalencia);
        res.status(200).send({ puntos: puntosCalculados })
      })
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  }
);


module.exports = router;
