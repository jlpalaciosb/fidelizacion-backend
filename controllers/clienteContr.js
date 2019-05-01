const Cliente = require('../models').Cliente;
const Bolsa = require('../models').Bolsa;

module.exports = {
  list(req, res) {
    return Cliente.findAll()
      .then(
        (clientes) => {
          res.status(200).send(clientes[0]);
        }
      )
      .catch(
        (error) => {
          res.status(400).send(error);
        }
      );
  },
  deBolsa(req, res) {
    return Bolsa.findAll()
      .then(bolsas => {
        return Cliente.findByPk(bolsas[0].cliente_id)
      }).then(cliente => res.status(200).send(cliente))
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  }
};
