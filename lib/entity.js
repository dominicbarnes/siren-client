
/**
 * Module dependencies.
 */

var clone = require('component/clone');
var defaults = require('avetisk/defaults');
var delegate = require('tj/node-delegates');

// single export
module.exports = Entity;

/**
 * A siren resource entity. Includes helpers for looking up things like
 * links/actions based on class or rel.
 *
 * @constructor
 * @param {Object} data  The raw response data.
 */
function Entity(data) {
  this.data = defaults(clone(data), {
    class: [],
    properties: {},
    entities: [],
    links: [],
    actions: [],
    title: '',
    href: '',
    rel: []
  });
}

// helpers
delegate(Entity.prototype, 'data')
  .getter('class')
  .getter('properties')
  .getter('links')
  .getter('actions')
  .getter('title')
  .getter('href')
  .getter('rel');

/**
 * This isn't a simple mapping, so we'll add a custom getter
 */
Object.defineProperty(Entity.prototype, 'entities', {
  get: function () {
    return this.data.entities.map(function (entity) {
      return new Entity(entity);
    });
  }
});

/**
 * Look up a link given a specific `rel`. It will return the **first** entity it
 * finds with the given rel value.
 *
 * @param  {String} rel  The rel to search for.
 * @return {Object}      The raw link object.
 */
Entity.prototype.link = function (rel) {
  var list = this.links;
  for (var x = 0; x < list.length; x += 1) {
    var link = list[x];
    if (link.rel && link.rel.indexOf(rel) > -1) return link;
  }
};

/**
 * A hook for exporting a serializable entity object.
 *
 * @return {Object}
 */
Entity.prototype.toObject = function () {
  return clone(this.data);
};

// TODO: links (retrieve all links matching rel)
// TODO: linkByClass (same as link, but searches class instead)
// TODO: linksByClass (same as links, but searches class instead)
// TODO: action (same as link, but for actions)
