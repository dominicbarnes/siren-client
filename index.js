
var Client = require('./lib/client');
var Entity = require('./lib/entity');

exports = module.exports = function () {
  return new Client();
};

exports.Client = Client;
exports.Entity = Entity;
