
/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var Entity = require('./entity');
var request = require('visionmedia/superagent');

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
 */
function Client() {
  // TODO?
}

// mixin
Emitter(Client.prototype);

/**
 * Retrieve a resource.
 *
 * @param {String} url  The URL to fetch.
 */
Client.prototype.get = function (url) {
  this.request('get', url).end(this.handle.bind(this));
};

/**
 * Perform an action against the current resource.
 *
 * @param  {String} url     The URL to submit the action to.
 * @param  {String} method  The HTTP verb to use. (default: 'get')
 * @param  {Object} data    The data to send. (already serialized as an object)
 * @return {superagent.Request}
 */
Client.prototype.action = function (url, method, data) {
  return this.request(method || 'get', url)
    .send(data)
    .end(this.handle.bind(this));
};

/**
 * Factory for superagent requests.
 *
 * @param  {String} method  The HTTP method name.
 * @param  {String} url     The resource URL.
 * @return {superagent.Request}
 */
Client.prototype.request = function (method, url) {
  return request(method, url)
    // .use(cache) TODO
    .accept('application/vnd.siren+json');
};

/**
 * Factory for creating entity objects.
 *
 * @param {Object} data  The entity data.
 * @return {Entity}
 */
Client.prototype.entity = function (data) {
  return new Entity(data);
};

/**
 * Handle a successful response.
 *
 * @param  {Error} [err]              An error, if applicable.
 * @param  {superagent.Response} res  The response object.
 */
Client.prototype.handle = function (err, res) {
  if (err) {
    this.emit('error', err);
  } else {
    this.emit('entity', this.entity(res.body), res.req.url);
  }
};
