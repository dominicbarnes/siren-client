
var assert = require('assert');
var nock = require('nock');
var siren = require('..');

var server = nock('http://localhost/').defaultReplyHeaders({ 'Content-Type': 'application/vnd.siren+json' });
var Client = siren.Client;
var Entity = siren.Entity;

describe('Client()', function () {
  it('should be a constructor function', function () {
    var client = new Client();
    assert(client instanceof Client);
  });

  describe('#get(href, [callback])', function () {
    var client = new Client();

    afterEach(function () {
      client.removeAllListeners();
    });

    it('should retrieve the specified url', function (done) {
      server.get('/1').reply(200, {});

      client.on('entity', function (entity) {
        assert(entity);
        done();
      });

      client.get('http://localhost/1');
    });

    it('should emit only an error when the content-type for the response is incorrect', function (done) {
      server.get('/2').reply(200, {}, { 'Content-Type': 'application/json' });

      client.on('entity', done);
      client.on('error', function (err) {
        assert(err);
        done();
      });

      client.get('http://localhost/2');
    });

    it('should return an Entity instance', function (done) {
      server.get('/3').reply(200, {});

      client.on('error', done);
      client.on('entity', function (entity) {
        assert(entity instanceof Entity);
        done();
      });

      client.get('http://localhost/3');
    });

    it('should pass the response body to the Entity constructor', function (done) {
      var data = { title: 'Hello World' };
      server.get('/4').reply(200, data);

      client.on('error', done);
      client.on('entity', function (entity) {
        assert.deepEqual(entity.toObject(), data);
        done();
      });

      client.get('http://localhost/4');
    });

    it('should fire the callback', function (done) {
      server.get('/5').reply(200, {});
      client.get('http://localhost/5', done);
    });
  });

  describe('#follow(link, [callback])', function () {
    var client = new Client();

    afterEach(function () {
      client.removeAllListeners();
    });

    it('should fire the callback', function (done) {
      server.get('/1').reply(200, {});
      client.follow('http://localhost/1', done);
    });

    context('with a link string', function () {
      it('should retrieve the specified url', function (done) {
        var data = { title: 'Hello World' };
        server.get('/2').reply(200, data);

        client.on('error', done);
        client.on('entity', function (entity) {
          assert.deepEqual(entity.toObject(), data);
          done();
        });

        client.follow('http://localhost/2');
      });

      it('should emit only an error when the content-type for the response is incorrect', function (done) {
        server.get('/3').reply(200, {}, { 'Content-Type': 'application/json' });

        client.on('entity', done);
        client.on('error', function (err) {
          assert(err);
          done();
        });

        client.follow('http://localhost/3');
      });

      it('should return an Entity instance', function (done) {
        server.get('/4').reply(200, {});

        client.on('error', done);
        client.on('entity', function (entity) {
          assert(entity instanceof Entity);
          done();
        });

        client.follow('http://localhost/4');
      });
    });

    context('with a link object', function () {
      it('should retrieve the specified url', function (done) {
        var data = { title: 'Hello World' };
        server.get('/5').reply(200, data);

        client.on('error', done);
        client.on('entity', function (entity) {
          assert.deepEqual(entity.toObject(), data);
          done();
        });

        client.follow({ href: 'http://localhost/5' });
      });

      it('should emit only an error when the content-type for the response is incorrect', function (done) {
        server.get('/6').reply(200, {}, { 'Content-Type': 'application/json' });

        client.on('entity', done);
        client.on('error', function (err) {
          assert(err);
          done();
        });

        client.follow({ href: 'http://localhost/6' });
      });

      it('should return an Entity instance', function (done) {
        server.get('/7').reply(200, {});

        client.on('error', done);
        client.on('entity', function (entity) {
          assert(entity instanceof Entity);
          done();
        });

        client.follow({ href: 'http://localhost/7' });
      });
    });
  });

  describe('#submit(action, data, [callback])', function () {
    var client = new Client();

    afterEach(function () {
      client.removeAllListeners();
    });

    it('should get the specified url with query params', function (done) {
      server.get('/search').query({ terms: 'test' }).reply(200, {});

      client.on('error', done);
      client.on('entity', function () {
        done();
      });

      var action = { href: 'http://localhost/search' };
      var data = { terms: 'test' };
      client.submit(action, data);
    });

    it('should post the specified url with serialized body', function (done) {
      server.post('/create', 'terms=test').reply(200, {});

      client.on('error', done);
      client.on('entity', function () {
        done();
      });

      var action = { href: 'http://localhost/create', method: 'post' };
      var data = { terms: 'test' };
      client.submit(action, data);
    });

    it('should make the response the new entity', function (done) {
      var result = { title: 'Hello World' };
      server.get('/search').query({ terms: 'test' }).reply(200, result);

      client.on('error', done);
      client.on('entity', function (entity) {
        assert.deepEqual(entity.toObject(), result);
        done();
      });

      var action = { href: 'http://localhost/search' };
      var data = { terms: 'test' };
      client.submit(action, data);
    });

    it('should fire the callback', function (done) {
      var action = { href: 'http://localhost/search' };
      server.get('/search').reply(200, {});
      client.submit(action, {}, done);
    });
  });
});
