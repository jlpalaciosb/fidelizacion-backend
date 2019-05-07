const models = require('../models');


module.exports = {

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


};
