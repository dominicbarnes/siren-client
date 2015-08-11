
var assert = require('component/assert');
var Entity = require('../lib/entity');

describe('Entity(data)', function () {
  it('should set up a complete object with empty defaults', function () {
    var e = new Entity({});
    assert.deepEqual(e.data, {
      class: [],
      properties: {},
      entities: [],
      links: [],
      actions: [],
      title: '',
      href: '',
      rel: []
    });
  });

  it('should not clobber passed values', function () {
    var e = new Entity({
      class: [ 'a' ],
      properties: { b: true },
      entities: [ 'c' ],
      links: [ 'd' ],
      actions: [ 'e' ],
      title: 'f',
      href: 'g',
      rel: [ 'h' ]
    });

    assert.deepEqual(e.data, {
      class: [ 'a' ],
      properties: { b: true },
      entities: [ 'c' ],
      links: [ 'd' ],
      actions: [ 'e' ],
      title: 'f',
      href: 'g',
      rel: [ 'h' ]
    });
  });

  describe('#class', function () {
    var arr = [ 'a', 'b' ];

    it('should retrieve the array', function () {
      var e = new Entity({ class: arr });
      assert.deepEqual(e.class, arr);
    });

    it('should clone inputs', function () {
      var e = new Entity({ class: arr });
      assert.notStrictEqual(e.class, arr);
    });
  });

  describe('#properties', function () {
    var obj = { a: true, b: false };

    it('should retrieve the object', function () {
      var e = new Entity({ properties: obj });
      assert.deepEqual(e.properties, obj);
    });

    it('should clone inputs', function () {
      var e = new Entity({ properties: obj });
      assert.notStrictEqual(e.properties, obj);
    });
  });

  describe('#links', function () {
    var arr = [
      { rel: [ 'a', 'b' ], href: 'c' }
    ];

    it('should retrieve the array', function () {
      var e = new Entity({ links: arr });
      assert.deepEqual(e.links, arr);
    });

    it('should clone inputs', function () {
      var e = new Entity({ links: arr });
      assert.notStrictEqual(e.links, arr);
    });
  });

  describe('#actions', function () {
    var arr = [
      { name: 'a', href: 'b' }
    ];

    it('should retrieve the array', function () {
      var e = new Entity({ actions: arr });
      assert.deepEqual(e.actions, arr);
    });

    it('should clone inputs', function () {
      var e = new Entity({ actions: arr });
      assert.notStrictEqual(e.actions, arr);
    });
  });

  describe('#title', function () {
    var title = 'a';

    it('should retrieve the string', function () {
      var e = new Entity({ title: title });
      assert.strictEqual(e.title, title);
    });
  });

  describe('#entities', function () {
    var arr = [
      { title: 'a' }
    ];

    it('should retrieve an array', function () {
      var e = new Entity({ entities: arr });
      assert(Array.isArray(e.entities));
    });

    it('should create Entity objects for each item', function () {
      var e = new Entity({ entities: arr });
      e.entities.forEach(function (entity, x) {
        assert(entity instanceof Entity);
        assert.strictEqual(entity.title, arr[x].title);
      });
    });
  });

  describe('#href', function () {
    var href = 'a';

    it('should retrieve the string', function () {
      var e = new Entity({ href: href });
      assert.strictEqual(e.href, href);
    });
  });

  describe('#rel', function () {
    var arr = [ 'a', 'b' ];

    it('should retrieve the array', function () {
      var e = new Entity({ rel: arr });
      assert.deepEqual(e.rel, arr);
    });

    it('should clone inputs', function () {
      var e = new Entity({ rel: arr });
      assert.notStrictEqual(e.rel, arr);
    });
  });
});
