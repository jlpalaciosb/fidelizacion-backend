const models = require('../models');
const Op = require('sequelize').Op;


module.exports = {
  listaVencimiento(req, res) {
    return models.ParamDuracion.findAll()
      .then(
        (paramDuracion) => {
          res.status(200).send(paramDuracion);
        }
      )
      .catch(
        (error) => {
          res.status(500).send(error);
        }
      );
  },
  getVencimiento(req, res) {
    return models.ParamDuracion.findByPk(req.params.idVencimiento)
      .then(paramDuracion => res.status(200).send(paramDuracion))
      .catch(error => res.status(500).send({ error: "Error al obtener vencimiento de punto" }))
  },
  nuevoVencimiento(req, res) {
    return models.ParamDuracion.create({
      validezIni: new Date(req.body.validezIni.replace(/-/g, '\/')),
      validezFin: new Date(req.body.validezFin.replace(/-/g, '\/')),
      duracion: req.body.duracion
    }).then((paramVencimiento) => {
      res.status(201).send({ success: 'Parametro de vencimiento creado exitosamente.' });
    })
      .catch(error => res.status(500).send({ error: "Error al crear parametro de vencimiento" }));
  },
  putVencimiento(req, res) {
    validezIni = req.body.validezIni;
    validezFin = req.body.validezFin;
    duracion = req.body.duracion;
    cuerpo = [];

    if (validezIni)
      cuerpo.push({ validezIni: new Date(req.body.validezIni.replace(/-/g, '\/')) });
    if (validezFin)
      cuerpo.push({ validezFin: new Date(req.body.validezFin.replace(/-/g, '\/')) });
    if (duracion) {
      cuerpo.push({ duracion: duracion });

    }
    if (cuerpo.length > 0) {
      var promises = [];
      cuerpo.forEach(function (campo) {
        promises.push(models.ParamDuracion.update(campo, { where: { id: req.params.idVencimiento } }));
      });
      Promise.all(promises).then(function () {
        res.status(201).send({ success: 'Parametro de vencimiento actualizado correctamente.' });
      }, function (err) {
        res.status(500).send({ error: "Error al actualizar parametro de vencimiento" })
      });

    }
    else return res.status(401).send({ error: "No se envio ningun campo para actualizar" })
  },
  deleteVencimiento(req, res) {
    return models.ParamDuracion.destroy({
      where: {
        id: req.params.idVencimiento
      }
    })
      .then(paramDuracion => {
        res.status(200).end();
      })
      .catch(
        (error) => res.status(400).send({ error: "Error al intentar eliminar vencimiento de punto" }));
  },

  //reglas
  listaReglas(req, res) {
    return models.Regla.findAll()
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
  getRegla(req, res) {
    return models.Regla.findByPk(req.params.idRegla)
      .then(regla => res.status(200).send(regla))
      .catch(error => res.status(500).send({ error: "Error al obtener regla" }))
  },
  validarPut(req, res, next) {
    models.Regla.findByPk(req.params.idRegla).then(regla => {
      req.put = true;
      if(req.body.limInferior === undefined) req.body.limInferior = regla.limInferior;
      if(req.body.limSuperior === undefined) req.body.limSuperior = regla.limSuperior;
      next();
    }).catch(reason => res.status(404).send());
  },
  validarReglaPost(req,res,next){
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
  },
  nuevaRegla(req, res) {
    return models.Regla.create({
      limInferior: req.body.limInferior,
      limSuperior: req.body.limSuperior,
      equivalencia: req.body.equivalencia
    }).then((regla) => {
      res.status(201).send({ success: 'Regla de asignacion de puntos creada exitosamente.' });
    })
      .catch(error => res.status(500).send({ error: "Error al crear regla de asignacion de puntos" }));
  },
  putRegla(req, res) {
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
  deleteRegla(req, res) {
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
  }
};
