const Bolsa = require('../models').Bolsa;

module.exports = {
  list(req, res) {
    return Bolsa.findAll()
      .then(bolsas => res.status(200).send(bolsas))
      .catch(error => {
        console.log(error);
        res.status(500).send('error del servidor');
      });
  }
};
