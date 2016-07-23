
/**
 * Module dependencies.
 */

var Emitter = require('events');
var Entity = require('./entity');
var request = require('superagent');
var util = require('util');

// parse siren as JSON
request.parse['application/vnd.siren+json'] = request.parse['application/json'];

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
  return this.request(href, 'GET').end(this.handle(callback));
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
  var type = action.type || 'form';

  var req = this.request(action.href, method).type(type);

  if (method === 'GET') {
    req.query(data);
  } else {
    req.send(data);
  }

  return req.end(this.handle(callback));
};

/**
 * Factory for superagent requests.
 *
 * @param  {String} href    The resource URL.
 * @param  {String} method  The HTTP method name.
 * @return {superagent.Request}
 */
Client.prototype.request = function (href, method) {
  return request(method, href)
    // .use(cache) TODO
    .accept('application/vnd.siren+json')
    .on('error', this.emit.bind(this, 'error'));
};

/**
 * Create a function to handle a siren response.
 *
 * @param {Function} [callback]  An optional callback to perform before emit.
 * @return {Function}
 */
Client.prototype.handle = function (callback) {
  var self = this;
  return function (err, res) {
    var href = url(res);
    if (err) {
      if (callback) callback(err);
      self.emit('error', err, href);
    } else if (res.type !== 'application/vnd.siren+json') {
      var error = new Error('did not find a valid siren response');
      if (callback) callback(error);
      self.emit('error', error, href);
    } else {
      var entity = new Entity(res.body);
      if (callback) callback(null, entity);
      self.emit('entity', entity, href);
    }
  };
};

/**
 * Returns the final URL of the response, allowing redirects to be handled
 * cleanly on the client-side.
 *
 * @param {superagent.Response} res  The AJAX response object to check.
 * @return {String}
 */
function url(res) {
  if (!res) return false;
  var req = res.req;
  if (req.xhr && req.xhr.responseURL) return req.xhr.responseURL;
  return req.url;
}
