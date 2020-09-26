module.exports = {
  responder: function(res, resultado, mensaje, extra) {
    let resObj = {resultado: resultado, mensaje: mensaje};
    if(extra !== undefined) Object.assign(resObj, extra);
    res.send(resObj);
  },
};
