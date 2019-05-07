const models = require('../models');


module.exports = {
    lista(req, res) {
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
    getVencimiento(req,res){
      return models.ParamDuracion.findByPk(req.params.idVencimiento)
          .then(paramDuracion=> res.status(200).send(paramDuracion))
          .catch(error=>res.status(500).send({error:"Error al obtener vencimiento de punto"}))
    },
    nuevoVencimiento(req, res) {
        return models.ParamDuracion.create({
            validezIni: new Date(req.body.validezIni.replace(/-/g, '\/')),
            validezFin: new Date(req.body.validezFin.replace(/-/g, '\/')),
            duracion: req.body.duracion
        }).then((paramVencimiento) => {
            res.status(201).send({success: 'Parametro de vencimiento creado exitosamente.'});
        })
            .catch(error => res.status(500).send({error: "Error al crear parametro de vencimiento"}));
    },
    putVencimiento(req, res) {
        return models.ParamDuracion.update({
            validezIni: new Date(req.body.validezIni.replace(/-/g, '\/')),
            validezFin: new Date(req.body.validezFin.replace(/-/g, '\/')),
            duracion: req.body.duracion
        },
            {
                where:{
                    id:req.params.idVencimiento
                }
            }).then((paramVencimiento) => {
            res.status(201).send({success: 'Parametro de vencimiento actualizado correctamente.'});
        })
            .catch(error => res.status(500).send({error: "Error al actualizar parametro de vencimiento"}));
    },

};
