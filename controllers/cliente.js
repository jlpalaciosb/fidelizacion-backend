const Cliente = require('../models').Cliente;

module.exports = {
    list(req, res) {
        return Cliente.findAll()
            .then(
                (clientes) => {
                    return res.status(200).send(clientes);
                }
            )
            .catch(
                (error) => {
                    return res.status(400).send(error);
                }
            );
    }
}
