
/**
 * Module dependencies.
 */

var Emitter = require('events');
var Entity = require('./entity');
var request = require('request');
var util = require('util');

// single export
module.exports = Client;

/**
 * A siren API client. Emits the following events:
 *
 *  - error(err)      After an error has occurred.
 *  - entity(entity)  After an entity/action has been retrieved.
 *
 * @constructor
 * @param {String} [href]  An entry-point href.
 */
function Client(href) {
  Emitter.call(this);
  this.jar = request.jar();
  if (href) this.get(href);
}

util.inherits(Client, Emitter);

/**
 * Fetch the entry point resource, setting the response as the current entity.
 *
 * @param {String} href  The URL to fetch.
 * @param {Function} [callback]  Optional callback.
 * @return {superagent.Request}
 */
Client.prototype.get = function (href, callback) {
  return this.follow(href, callback);
};

/**
 * Follow the `link` and set that as the new current entity. The `link` can be a
 * plain link or an embedded entity link. (or anything with an href property)
 *
 * @param {Object} link  Siren link object.
 * @param {Function} [callback]  Optional callback.
 * @return {superagent.Request}
 */
Client.prototype.follow = function (link, callback) {
  var href = typeof link === 'string' ? link : link.href;
  return this.request(href, 'GET', null, callback);
};

/**
 * Submit the `action` and set the response as the new current entity.
 *
 * @param {Object} action  Siren action object.
 * @param {Object} [data]  Serialized data representing the action fields.
 * @param {Function} [callback]  Optional callback.
 * @return {superagent.Request}
 */
Client.prototype.submit = function (action, data, callback) {
  var method = (action.method || 'GET').toUpperCase();

  var options = {};
  if (method === 'GET') {
    options.qs = data;
  } else if (action.type === 'application/json') {
    options.json = data;
  } else {
    options.form = data;
  }

  return this.request(action.href, method, options, callback);
};

/**
 * Factory for superagent requests.
 *
 * @param  {String} href    The resource URL.
 * @param  {String} method  The HTTP method name.
 * @return {superagent.Request}
 */
Client.prototype.request = function (href, method, options, callback) {
  var defaults = {
    uri: href,
    method: method,
    headers: { accept: 'application/vnd.siren+json' },
    json: true,
    jar: this.jar,
    followAllRedirects: true
  };

  return request(Object.assign(defaults, options), this.handle(callback));
};

/**
 * Create a function to handle a siren response.
 *
 * @param {Function} [callback]  An optional callback to perform before emit.
 * @return {Function}
 */
Client.prototype.handle = function (callback) {
  var self = this;
  return function (err, res, body) {
    if (err) {
      if (callback) callback(err);
      self.emit('error', err);
    } else if (res.headers['content-type'] !== 'application/vnd.siren+json') {
      var error = new Error('did not find a valid siren response');
      if (callback) callback(error);
      self.emit('error', error, res.request.href);
    } else {
      var entity = new Entity(body);
      if (callback) callback(null, entity);
      self.emit('entity', entity, res.request.href);
    }
  };
};
