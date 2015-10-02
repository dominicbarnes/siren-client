/* eslint-disable no-param-reassign */

var clone = require('component/clone');
var finder = require('component/find');


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
  this.data = clone(data);
}

/**
 * Get the title of this entity.
 *
 * @return {String}
 */
Entity.prototype.title = function () {
  return this.data.title || '';
};

/**
 * Get the properties for this entity. (if none present, an empty object
 * will be returned)
 *
 * @return {Object}
 */
Entity.prototype.properties = function () {
  if (!this.data.properties) return {};
  return clone(this.data.properties);
};

/**
 * Get the title of this entity.
 *
 * @return {String}
 */
Entity.prototype.class = function () {
  if (!this.data.class) return [];
  return clone(this.data.class);
};

/**
 * Find the first entity matching the given `search` criteria.
 *
 * @see matchEntity
 * @param {String|Object} search  The search criteria to use.
 * @return {Object}
 */
Entity.prototype.entity = function (search) {
  var list = this.data.entities;
  if (!list) return null;

  var ret = finder(list, function (entity, x) {
    return matchEntity(search, entity, x);
  });

  if (!ret) return;
  return new Entity(ret);
};

/**
 * Find all entities matching the given `search` criteria.
 *
 * @see matchEntity
 * @param {String|Object} search  The search criteria to use.
 * @return {Array}
 */
Entity.prototype.entities = function (search) {
  var list = this.data.entities;
  if (!list) return [];

  return list
    .filter(function (entity, x) {
      return matchEntity(search, entity, x);
    })
    .map(function (entity) {
      return new Entity(entity);
    });
};

/**
 * Find the first link matching the given `search` param.
 *
 * @see matchLink
 * @param {String|Object} search  The search criteria to use.
 * @return {Object}
 */
Entity.prototype.link = function (search) {
  var list = this.data.links;
  if (!list) return null;

  return finder(list, function (link, x) {
    return matchLink(search, link, x);
  });
};

/**
 * Find all links matching the given `search` param.
 *
 * @see matchLink
 * @param {String|Object} search  The search criteria to use.
 * @return {Array}
 */
Entity.prototype.links = function (search) {
  var list = this.data.links;
  if (!list) return [];

  return list.filter(function (link, x) {
    return matchLink(search, link, x);
  });
};

/**
 * Find the first action matching the given `search` param.
 *
 * @see matchAction
 * @param {String|Object} search  The search criteria to use.
 * @return {Object}
 */
Entity.prototype.action = function (search) {
  var list = this.data.actions;
  if (!list) return null;

  return finder(list, function (action, x) {
    return matchAction(search, action, x);
  });
};

/**
 * Find all actions matching the given `search` param.
 *
 * @see matchAction
 * @param {String|Object} search  The search criteria to use.
 * @return {Array}
 */
Entity.prototype.actions = function (search) {
  var list = this.data.actions;
  if (!list) return [];

  return list.filter(function (action, x) {
    return matchAction(search, action, x);
  });
};

/**
 * A hook for exporting a serializable entity object.
 *
 * @return {Object}
 */
Entity.prototype.toObject = function () {
  return clone(this.data);
};


// private helpers

/**
 * Determine if the given `link` matches the given `search` criteria.
 *
 * If `criteria` is a string, then it will check to see if any of the `rel`
 * values match.
 *
 * If an object, it will check a couple different criteria. (where any match
 * is considered a match for the entire link) First, it checks `rel`, then
 * it checks `class`.
 *
 * @param {String|Object} search  The search criteria.
 * @param {Object} entity         The link to check.
 * @return {Boolean}
 */
function matchEntity(search, entity, x) {
  if (!search) return true;
  if (typeof search === 'string') return contains(entity.rel, search);
  if (typeof search === 'function') return search(entity, x);
  if (search.rel) return contains(entity.rel, search.rel);
  if (search.class) return contains(entity.class, search.class);
  return false;
}

/**
 * Determine if the given `link` matches the given `search` criteria.
 *
 * If `criteria` is a string, then it will check to see if any of the `rel`
 * values match.
 *
 * If an object, it will check a couple different criteria. (where any match
 * is considered a match for the entire link) First, it checks `rel`, then
 * it checks `class`.
 *
 * @param {String|Object} search  The search criteria.
 * @param {Object} link           The link to check.
 * @return {Boolean}
 */
function matchLink(search, link, x) {
  if (!search) return true;
  if (typeof search === 'string') return contains(link.rel, search);
  if (typeof search === 'function') return search(link, x);
  if (search.rel) return contains(link.rel, search.rel);
  if (search.class) return contains(link.class, search.class);
  return false;
}

/**
 * Determine if the given `action` matches the given `search` criteria.
 *
 * If `criteria` is a string, then it will check to see if any of the `rel`
 * values match.
 *
 * If an object, it will check a couple different criteria. (where any match
 * is considered a match for the entire action) First, it checks `rel`, then
 * it checks `class`.
 *
 * @param {String|Object} search  The search criteria.
 * @param {Object} action           The action to check.
 * @return {Boolean}
 */
function matchAction(search, action, x) {
  if (!search) return true;
  if (typeof search === 'string') return action.name === search;
  if (typeof search === 'function') return search(action, x);
  if (search.name) return action.name === search.name;
  if (search.class) return contains(action.class, search.class);
  return false;
}

/**
 * Checks the input `list` for any of the given `inputs`.
 *
 * @param {Array} haystack        The list to search within.
 * @param {String|Array} needles  The value(s) to look for.
 * @return {Boolean}
 */
function contains(haystack, needles) {
  if (!haystack) return false;
  if (!Array.isArray(needles)) needles = [ needles ];

  return needles.every(function (needle) {
    return haystack.indexOf(needle) > -1;
  });
}
