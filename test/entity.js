
var assert = require('component/assert');
var Entity = require('../lib/entity');

describe('Entity(data)', function () {
  it('should clone the input data', function () {
    var data = {};
    var entity = new Entity(data);
    assert.notStrictEqual(entity.data, data);
    assert.deepEqual(entity.data, data);
  });

  describe('#class()', function () {
    var arr = [ 'a', 'b' ];

    it('should retrieve the array', function () {
      var e = new Entity({ class: arr });
      assert.deepEqual(e.class(), arr);
    });

    it('should return a clone', function () {
      var e = new Entity({ class: arr });
      assert.notStrictEqual(e.class(), arr);
    });

    it('should return an empty array when no classes are specified', function () {
      var e = new Entity({});
      var result = e.class();
      assert(Array.isArray(result));
      assert.equal(result.length, 0);
    });
  });

  describe('#properties()', function () {
    var obj = { a: true, b: false };

    it('should retrieve the object', function () {
      var e = new Entity({ properties: obj });
      assert.deepEqual(e.properties(), obj);
    });

    it('should return a clone', function () {
      var e = new Entity({ properties: obj });
      assert.notStrictEqual(e.properties(), obj);
    });
  });

  describe('#entity([search])', function () {
    it('should return the first entity', function () {
      var arr = [
        { rel: [ 'item' ], title: 'A' },
        { rel: [ 'item' ], title: 'B' }
      ];

      var e = new Entity({ entities: arr });

      var actual = e.entity().toObject();
      var expected = arr[0];

      assert.deepEqual(actual, expected);
    });

    it('should return empty when no entities', function () {
      var e = new Entity({ entities: [] });
      assert(!e.entity());
    });

    context('with search criteria', function () {
      var arr = [
        { class: [ 'a' ], rel: [ 'self' ], title: 'A' },
        { class: [ 'b' ], rel: [ 'item' ], title: 'B' },
        { class: [ 'c' ], rel: [ 'item' ], title: 'C' },
        { class: [ 'a', 'c' ], rel: [ 'self', 'index' ], title: 'D' }
      ];

      var e = new Entity({ entities: arr });

      context('as a string', function () {
        it('should return the first entity with a matching rel', function () {
          var actual = e.entity('index').toObject();
          var expected = arr[3];

          assert.deepEqual(actual, expected);
        });

        it('should return empty for a non-existant rel', function () {
          assert(!e.entity('does-not-exist'));
        });
      });

      context('as an object', function () {
        context('with a rel string', function () {
          it('should return the first entity with a matching rel', function () {
            var actual = e.entity({ rel: 'index' }).toObject();
            var expected = arr[3];

            assert.deepEqual(actual, expected);
          });

          it('should return an empty collection for a non-existant rel', function () {
            assert(!e.entity({ rel: 'does-not-exist' }));
          });
        });

        context('with a rel array', function () {
          it('should return the first entity with all matching rels', function () {
            var actual = e.entity({ rel: [ 'self', 'index' ] }).toObject();
            var expected = arr[3];

            assert.deepEqual(actual, expected);
          });

          it('should return an empty collection for a non-existant rel', function () {
            assert(!e.entity({ rel: [ 'item', 'does-not-exist' ] }));
          });
        });

        context('with a class string', function () {
          it('should return the first entity with a matching class', function () {
            var actual = e.entity({ class: 'b' }).toObject();
            var expected = arr[1];

            assert.deepEqual(actual, expected);
          });

          it('should return an empty collection for a non-existant class', function () {
            assert(!e.entity({ class: 'does-not-exist' }));
          });
        });

        context('with a class array', function () {
          it('should return the first entity with all matching classes', function () {
            var actual = e.entity({ class: [ 'a', 'c' ] }).toObject();
            var expected = arr[3];

            assert.deepEqual(actual, expected);
          });

          it('should return an empty collection for a non-existant rel', function () {
            assert(!e.entity({ class: [ 'a', 'does-not-exist' ] }));
          });
        });
      });

      context('as a function', function () {
        it('should return the first entity that pass the truth test', function () {
          var actual = e.entity(function (entity, x) {
            return (x + 1) % 2 === 0; // even numbers only!
          }).toObject();

          var expected = arr[1];

          assert.deepEqual(actual, expected);
        });
      });
    });
  });

  describe('#entities([search])', function () {
    var arr = [
      { title: 'a' }
    ];

    it('should retrieve an array', function () {
      var e = new Entity({ entities: arr });
      var result = e.entities();
      assert(Array.isArray(result));
      assert.equal(result.length, 1);
    });

    it('should create Entity objects for each item', function () {
      var e = new Entity({ entities: arr });
      e.entities().forEach(function (entity) {
        assert(entity instanceof Entity);
      });
    });

    it('should return clones', function () {
      var e = new Entity({ entities: arr });
      e.entities().forEach(function (entity, x) {
        var actual = entity.toObject();
        assert.deepEqual(actual, arr[x]);
        assert.notStrictEqual(actual, arr[x]);
      });
    });

    it('should return an empty array when no entities are specified', function () {
      var e = new Entity({});
      var result = e.entities();
      assert(Array.isArray(result));
      assert.equal(result.length, 0);
    });

    context('with search criteria', function () {
      var arr = [
        { class: [ 'a' ], rel: [ 'self' ], title: 'A' },
        { class: [ 'b' ], rel: [ 'item' ], title: 'B' },
        { class: [ 'c' ], rel: [ 'item' ], title: 'C' },
        { class: [ 'a', 'c' ], rel: [ 'self', 'index' ], title: 'D' }
      ];

      var e = new Entity({ entities: arr });

      context('as a string', function () {
        it('should return all entities with a matching rel', function () {
          var list = e.entities('item');

          var actual = list.map(function (entity) {
            return entity.toObject();
          });

          var expected = arr.slice(1, 3);

          assert.deepEqual(actual, expected);
        });

        it('should return an empty collection for a non-existant rel', function () {
          var list = e.entities('does-not-exist');
          assert.equal(list.length, 0);
        });
      });

      context('as an object', function () {
        context('with a rel string', function () {
          it('should return all entities with a matching rel', function () {
            var list = e.entities({ rel: 'item' });

            var actual = list.map(function (entity) {
              return entity.toObject();
            });

            var expected = arr.slice(1, 3);

            assert.deepEqual(actual, expected);
          });

          it('should return an empty collection for a non-existant rel', function () {
            var list = e.entities({ rel: 'does-not-exist' });
            assert.equal(list.length, 0);
          });
        });

        context('with a rel array', function () {
          it('should return all entities with all matching rels', function () {
            var list = e.entities({ rel: [ 'self', 'index' ] });

            var actual = list.map(function (entity) {
              return entity.toObject();
            });

            var expected = [ arr[3] ];

            assert.deepEqual(actual, expected);
          });

          it('should return an empty collection for a non-existant rel', function () {
            var list = e.entities({ rel: [ 'item', 'does-not-exist' ] });
            assert.equal(list.length, 0);
          });
        });

        context('with a class string', function () {
          it('should return all entities with a matching class', function () {
            var list = e.entities({ class: 'a' });

            var actual = list.map(function (entity) {
              return entity.toObject();
            });

            var expected = [ arr[0], arr[3] ];

            assert.deepEqual(actual, expected);
          });

          it('should return an empty collection for a non-existant class', function () {
            var list = e.entities({ class: 'does-not-exist' });
            assert.equal(list.length, 0);
          });
        });

        context('with a class array', function () {
          it('should return all entities with all matching classes', function () {
            var list = e.entities({ class: [ 'a', 'c' ] });

            var actual = list.map(function (entity) {
              return entity.toObject();
            });

            var expected = [ arr[3] ];

            assert.deepEqual(actual, expected);
          });

          it('should return an empty collection for a non-existant rel', function () {
            var list = e.entities({ class: [ 'a', 'does-not-exist' ] });
            assert.equal(list.length, 0);
          });
        });
      });

      context('as a function', function () {
        it('should return all entities that pass the truth test', function () {
          var list = e.entities(function (entity, x) {
            return (x + 1) % 2 === 0; // even numbers only!
          });

          var actual = list.map(function (entity) {
            return entity.toObject();
          });

          var expected = [ arr[1], arr[3] ];

          assert.deepEqual(actual, expected);
        });
      });
    });
  });

  describe('#link([search])', function () {
    it('should return the first link', function () {
      var arr = [
        { rel: [ 'self' ], href: '/1' },
        { rel: [ 'self' ], href: '/2' }
      ];

      var e = new Entity({ links: arr });
      assert.deepEqual(e.link(), arr[0]);
    });

    it('should return empty when no links', function () {
      var e = new Entity({ links: [] });
      assert(!e.link());
    });

    context('with search criteria', function () {
      var arr = [
        { rel: [ 'self' ], class: [ 'a' ], href: '/1' },
        { rel: [ 'item' ], class: [ 'b' ], href: '/2' },
        { rel: [ 'item' ], class: [ 'c' ], href: '/3' },
        { rel: [ 'parent', 'index' ], class: [ 'a', 'b' ], href: '/4' }
      ];

      var e = new Entity({ links: arr });

      context('as a string', function () {
        it('should return the first link with a matching rel', function () {
          assert.deepEqual(e.link('index'), arr[3]);
        });

        it('should return empty for a non-existant rel', function () {
          assert(!e.link('does-not-exist'));
        });
      });

      context('as an object', function () {
        context('with a rel string', function () {
          it('should return the first link with a matching rel', function () {
            assert.deepEqual(e.link({ rel: 'index' }), arr[3]);
          });

          it('should return an empty collection for a non-existant rel', function () {
            assert(!e.link({ rel: 'does-not-exist' }));
          });
        });

        context('with a rel array', function () {
          it('should return the first link with all matching rels', function () {
            assert.deepEqual(e.link({ rel: [ 'parent', 'index' ] }), arr[3]);
          });

          it('should return an empty collection for a non-existant rel', function () {
            assert(!e.link({ rel: [ 'item', 'does-not-exist' ] }));
          });
        });

        context('with a class string', function () {
          it('should return the first link with a matching class', function () {
            assert.deepEqual(e.link({ class: 'b' }), arr[1]);
          });

          it('should return an empty collection for a non-existant class', function () {
            assert(!e.link({ class: 'does-not-exist' }));
          });
        });

        context('with a class array', function () {
          it('should return the first link with all matching classes', function () {
            assert.deepEqual(e.link({ class: [ 'a', 'b' ] }), arr[3]);
          });

          it('should return an empty collection for a non-existant rel', function () {
            assert(!e.link({ class: [ 'a', 'does-not-exist' ] }));
          });
        });
      });

      context('as a function', function () {
        it('should return the first link that pass the truth test', function () {
          var actual = e.link(function (link, x) {
            return (x + 1) % 2 === 0; // even numbers only!
          });

          assert.deepEqual(actual, arr[1]);
        });
      });
    });
  });

  describe('#links([search])', function () {
    var arr = [ { title: 'a' } ];
    var e = new Entity({ links: arr });

    it('should retrieve an array', function () {
      var result = e.links();
      assert(Array.isArray(result));
      assert.equal(result.length, 1);
    });

    it('should return clones', function () {
      e.links().forEach(function (link, x) {
        assert.deepEqual(link, arr[x]);
        assert.notStrictEqual(link, arr[x]);
      });
    });

    it('should return an empty array when no links are specified', function () {
      var e = new Entity({});
      var result = e.links();
      assert(Array.isArray(result));
      assert.equal(result.length, 0);
    });

    context('with search criteria', function () {
      var arr = [
        { class: [ 'a' ], rel: [ 'self' ], title: 'A' },
        { class: [ 'b' ], rel: [ 'item' ], title: 'B' },
        { class: [ 'c' ], rel: [ 'item' ], title: 'C' },
        { class: [ 'a', 'c' ], rel: [ 'self', 'index' ], title: 'D' }
      ];

      var e = new Entity({ links: arr });

      context('as a string', function () {
        it('should return all links with a matching rel', function () {
          assert.deepEqual(e.links('item'), arr.slice(1, 3));
        });

        it('should return an empty collection for a non-existant rel', function () {
          var list = e.links('does-not-exist');
          assert.equal(list.length, 0);
        });
      });

      context('as an object', function () {
        context('with a rel string', function () {
          it('should return all links with a matching rel', function () {
            var list = e.links({ rel: 'item' });
            assert.deepEqual(list, arr.slice(1, 3));
          });

          it('should return an empty collection for a non-existant rel', function () {
            var list = e.links({ rel: 'does-not-exist' });
            assert.equal(list.length, 0);
          });
        });

        context('with a rel array', function () {
          it('should return all links with all matching rels', function () {
            var list = e.links({ rel: [ 'self', 'index' ] });
            assert.deepEqual(list, [ arr[3] ]);
          });

          it('should return an empty collection for a non-existant rel', function () {
            var list = e.links({ rel: [ 'item', 'does-not-exist' ] });
            assert.equal(list.length, 0);
          });
        });

        context('with a class string', function () {
          it('should return all links with a matching class', function () {
            var list = e.links({ class: 'a' });
            assert.deepEqual(list, [ arr[0], arr[3] ]);
          });

          it('should return an empty collection for a non-existant class', function () {
            var list = e.links({ class: 'does-not-exist' });
            assert.equal(list.length, 0);
          });
        });

        context('with a class array', function () {
          it('should return all links with all matching classes', function () {
            var list = e.links({ class: [ 'a', 'c' ] });
            assert.deepEqual(list, [ arr[3] ]);
          });

          it('should return an empty collection for a non-existant rel', function () {
            var list = e.links({ class: [ 'a', 'does-not-exist' ] });
            assert.equal(list.length, 0);
          });
        });
      });

      context('as a function', function () {
        it('should return all links that pass the truth test', function () {
          var list = e.links(function (link, x) {
            return (x + 1) % 2 === 0; // even numbers only!
          });

          assert.deepEqual(list, [ arr[1], arr[3] ]);
        });
      });
    });
  });

  describe('#action([search])', function () {
    it('should return the first action', function () {
      var arr = [
        { name: 'a', href: '/1' },
        { name: 'b', href: '/2' }
      ];

      var e = new Entity({ actions: arr });
      assert.deepEqual(e.action(), arr[0]);
    });

    it('should return empty when no actions', function () {
      var e = new Entity({ actions: [] });
      assert(!e.action());
    });

    context('with search criteria', function () {
      var arr = [
        { name: 'login', class: [ 'a' ], href: '/1' },
        { name: 'logout', class: [ 'b' ], href: '/2' },
        { name: 'signup', class: [ 'c' ], href: '/3' },
        { name: 'help', class: [ 'a', 'b' ], href: '/4' }
      ];

      var e = new Entity({ actions: arr });

      context('as a string', function () {
        it('should return the first action with a matching name', function () {
          assert.deepEqual(e.action('signup'), arr[2]);
        });

        it('should return empty for a non-existant name', function () {
          assert(!e.action('does-not-exist'));
        });
      });

      context('as an object', function () {
        context('with a name string', function () {
          it('should return the first action with a matching name', function () {
            assert.deepEqual(e.action({ name: 'signup' }), arr[2]);
          });

          it('should return an empty collection for a non-existant name', function () {
            assert(!e.action({ name: 'does-not-exist' }));
          });
        });

        context('with a class string', function () {
          it('should return the first action with a matching class', function () {
            assert.deepEqual(e.action({ class: 'b' }), arr[1]);
          });

          it('should return an empty collection for a non-existant class', function () {
            assert(!e.action({ class: 'does-not-exist' }));
          });
        });

        context('with a class array', function () {
          it('should return the first action with all matching classes', function () {
            assert.deepEqual(e.action({ class: [ 'a', 'b' ] }), arr[3]);
          });

          it('should return an empty collection for a non-existant class', function () {
            assert(!e.action({ class: [ 'a', 'does-not-exist' ] }));
          });
        });
      });

      context('as a function', function () {
        it('should return the first action that pass the truth test', function () {
          var actual = e.action(function (action, x) {
            return (x + 1) % 2 === 0; // even numbers only!
          });

          assert.deepEqual(actual, arr[1]);
        });
      });
    });
  });

  describe('#actions([search])', function () {
    var arr = [ { title: 'a' } ];
    var e = new Entity({ actions: arr });

    it('should retrieve an array', function () {
      var result = e.actions();
      assert(Array.isArray(result));
      assert.equal(result.length, 1);
    });

    it('should return clones', function () {
      e.actions().forEach(function (action, x) {
        assert.deepEqual(action, arr[x]);
        assert.notStrictEqual(action, arr[x]);
      });
    });

    it('should return an empty array when no actions are specified', function () {
      var e = new Entity({});
      var result = e.actions();
      assert(Array.isArray(result));
      assert.equal(result.length, 0);
    });

    context('with search criteria', function () {
      var arr = [
        { name: 'login', class: [ 'a' ], title: 'A' },
        { name: 'logout', class: [ 'b' ], title: 'B' },
        { name: 'signup', class: [ 'c' ], title: 'C' },
        { name: 'help', class: [ 'a', 'c' ], title: 'D' }
      ];

      var e = new Entity({ actions: arr });

      context('as a string', function () {
        it('should return all actions with a matching name', function () {
          assert.deepEqual(e.actions('signup'), [ arr[2] ]);
        });

        it('should return an empty collection for a non-existant name', function () {
          var list = e.actions('does-not-exist');
          assert.equal(list.length, 0);
        });
      });

      context('as an object', function () {
        context('with a name string', function () {
          it('should return all actions with a matching name', function () {
            var list = e.actions({ name: 'signup' });
            assert.deepEqual(list, [ arr[2] ]);
          });

          it('should return an empty collection for a non-existant name', function () {
            var list = e.actions({ name: 'does-not-exist' });
            assert.equal(list.length, 0);
          });
        });

        context('with a class string', function () {
          it('should return all actions with a matching class', function () {
            var list = e.actions({ class: 'a' });
            assert.deepEqual(list, [ arr[0], arr[3] ]);
          });

          it('should return an empty collection for a non-existant class', function () {
            var list = e.actions({ class: 'does-not-exist' });
            assert.equal(list.length, 0);
          });
        });

        context('with a class array', function () {
          it('should return all actions with all matching classes', function () {
            var list = e.actions({ class: [ 'a', 'c' ] });
            assert.deepEqual(list, [ arr[3] ]);
          });

          it('should return an empty collection for a non-existant name', function () {
            var list = e.actions({ class: [ 'a', 'does-not-exist' ] });
            assert.equal(list.length, 0);
          });
        });
      });

      context('as a function', function () {
        it('should return all actions that pass the truth test', function () {
          var list = e.actions(function (action, x) {
            return (x + 1) % 2 === 0; // even numbers only!
          });

          assert.deepEqual(list, [ arr[1], arr[3] ]);
        });
      });
    });
  });

  describe('#title()', function () {
    var title = 'a';

    it('should retrieve the title', function () {
      var e = new Entity({ title: title });
      assert.strictEqual(e.title(), title);
    });
  });

  describe('#toObject()', function () {
    it('should return a clone of the original object', function () {
      var expected = {
        title: 'Hello World',
        links: [
          { rel: 'self', href: '/' }
        ]
      };

      var actual = (new Entity(expected)).toObject();
      assert.deepEqual(actual, expected);
      assert.notStrictEqual(actual, expected);
    });
  });
});
