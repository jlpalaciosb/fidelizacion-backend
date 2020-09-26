const express = require('express');
const router = express.router();
const models = require('../models');

router.get(
  '',
  (req, res, next) => {
    console.log('GET lista vencimientos');
    next();
  },
  (req, res) => {
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
);

router.get(
  '(:idVencimiento)\\d+',
  (req, res, next) => {
    console.log('GET vencimiento por idVencimiento');
    next();
  },
  (req, res) => {
    return models.ParamDuracion.findByPk(req.params.idVencimiento)
      .then(paramDuracion => res.status(200).send(paramDuracion))
      .catch(error => res.status(500).send({ error: "Error al obtener vencimiento de punto" }))
  },
);

router.post(
  '',
  (req, res, next) => {
    console.log('POST vencimiento de puntos');
    next();
  },
  (req, res) => {
    return models.ParamDuracion.create({
      validezIni: new Date(req.body.validezIni.replace(/-/g, '\/')),
      validezFin: new Date(req.body.validezFin.replace(/-/g, '\/')),
      duracion: req.body.duracion
    }).then((paramVencimiento) => {
      res.status(201).send({ success: 'Parametro de vencimiento creado exitosamente.' });
    })
      .catch(error => res.status(500).send({ error: "Error al crear parametro de vencimiento" }));
  },
);

router.put(
  '(:idVencimiento)\\d+',
  (req, res, next) => {
    console.log('PUT vencimiento');
    next();
  },
  (req, res) => {
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
    else return res.status(401).send({ error: "No se envio ningun campo para actualizar" });
  },
);

router.delete(
  '(:idVencimiento)\\d+',
  (req, res, next) => {
    console.log('DELETE vencimiento');
    next();
  },
  (req, res) => {
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
);

module.exports = router;
