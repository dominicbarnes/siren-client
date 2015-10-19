
/* global sinon */

var assert = require('component/assert');
var load = require('eldargab/load-script');
var siren = require('..');

var Client = siren.Client;
var Entity = siren.Entity;

describe('Client()', function () {
  before(function (done) {
    // loading via external script, because it doesn't play well with duo/component
    load('//cdnjs.cloudflare.com/ajax/libs/sinon.js/1.15.4/sinon.min.js', done);
  });

  it('should be a constructor function', function () {
    var client = new Client();
    assert(client instanceof Client);
  });

  it('should be an emitter', function () {
    assert(Client.prototype.on, 'should have an on method');
  });

  describe('#get(href, [callback])', function () {
    var xhr;
    var requests = [];
    var client = new Client();

    before(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = function (request) {
        requests.push(request);
      };
    });

    afterEach(function () {
      client.off('error').off('entity');
      assert.equal(requests.length, 0);
    });

    after(function () {
      xhr.restore();
    });

    it('should retrieve the specified url', function (done) {
      client.on('entity', function (entity) {
        assert(entity);
        done();
      });

      client.get('/1');

      var request = requests.pop();
      assert.equal(request.url, '/1');
      assert.equal(request.method.toLowerCase(), 'get');
      respond(request);
    });

    it('should emit only an error when the content-type for the response is incorrect', function (done) {
      client.on('entity', done);
      client.on('error', function (err) {
        assert(err);
        done();
      });

      client.get('/2');
      respond(requests.pop(), {}, { 'Content-Type': 'application/json' });
    });

    it('should return an Entity instance', function (done) {
      client.on('error', done);
      client.on('entity', function (entity) {
        assert(entity instanceof Entity);
        done();
      });

      client.get('/3');
      respond(requests.pop());
    });

    it('should pass the response body to the Entity constructor', function (done) {
      var data = { title: 'Hello World' };

      client.on('error', done);
      client.on('entity', function (entity) {
        assert.deepEqual(entity.toObject(), data);
        done();
      });

      client.get('/4');
      respond(requests.pop(), data);
    });

    it('should fire the callback', function (done) {
      client.get('/4', done);
      respond(requests.pop());
    });
  });

  describe('#follow(link, [callback])', function () {
    var xhr;
    var requests = [];
    var client = new Client();

    before(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = function (request) {
        requests.push(request);
      };
    });

    // ensure the request queue is empty
    afterEach(function () {
      client.off('error').off('entity');
      assert.equal(requests.length, 0);
    });

    after(function () {
      xhr.restore();
    });

    it('should fire the callback', function (done) {
      client.follow('/4', done);
      respond(requests.pop());
    });

    context('with a link string', function () {
      it('should retrieve the specified url', function (done) {
        var data = { title: 'Hello World' };

        client.on('error', done);
        client.on('entity', function (entity) {
          assert.deepEqual(entity.toObject(), data);
          done();
        });

        client.follow('/5');
        var request = requests.pop();
        assert.equal(request.url, '/5');
        assert.equal(request.method.toLowerCase(), 'get');
        respond(request, data);
      });

      it('should emit only an error when the content-type for the response is incorrect', function (done) {
        client.on('entity', done);
        client.on('error', function (err) {
          assert(err);
          done();
        });

        client.follow('/6');
        respond(requests.pop(), {}, { 'Content-Type': 'application/json' });
      });

      it('should return an Entity instance', function (done) {
        client.on('error', done);
        client.on('entity', function (entity) {
          assert(entity instanceof Entity);
          done();
        });

        client.follow('/7');
        respond(requests.pop());
      });
    });

    context('with a link object', function () {
      it('should retrieve the specified url', function (done) {
        var data = { title: 'Hello World' };

        client.on('error', done);
        client.on('entity', function (entity) {
          assert.deepEqual(entity.toObject(), data);
          done();
        });

        client.follow({ href: '/8' });

        var request = requests.pop();
        assert.equal(request.url, '/8');
        assert.equal(request.method.toLowerCase(), 'get');
        respond(request, data);
      });

      it('should emit only an error when the content-type for the response is incorrect', function (done) {
        client.on('entity', done);
        client.on('error', function (err) {
          assert(err);
          done();
        });

        client.follow({ href: '/9' });
        respond(requests.pop(), {}, { 'Content-Type': 'application/json' });
      });

      it('should return an Entity instance', function (done) {
        client.on('error', done);
        client.on('entity', function (entity) {
          assert(entity instanceof Entity);
          done();
        });

        client.follow({ href: '/10' });
        respond(requests.pop());
      });
    });
  });

  describe('#submit(action, data, [callback])', function () {
    var xhr;
    var requests = [];
    var client = new Client();

    before(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = function (request) {
        requests.push(request);
      };
    });

    // ensure the request queue is empty
    afterEach(function () {
      client.off('error').off('entity');
      assert.equal(requests.length, 0);
    });

    after(function () {
      xhr.restore();
    });

    it('should get the specified url with query params', function (done) {
      client.on('error', done);
      client.on('entity', function () {
        done();
      });

      var action = { href: '/search' };
      var data = { terms: 'test' };
      client.submit(action, data);

      var request = requests.pop();
      assert.equal(request.url, '/search?terms=test');
      assert.equal(request.method.toLowerCase(), 'get');

      respond(request);
    });

    it('should post the specified url with serialized body', function (done) {
      client.on('error', done);
      client.on('entity', function () {
        done();
      });

      var action = { href: '/create', method: 'post' };
      var data = { terms: 'test' };
      client.submit(action, data);

      var request = requests.pop();
      assert.equal(request.url, '/create');
      assert.equal(request.method.toLowerCase(), 'post');
      assert.equal(request.requestHeaders['Content-Type'], 'application/x-www-form-urlencoded;charset=utf-8');
      assert.equal(request.requestBody, 'terms=test');

      respond(request);
    });

    it('should make the response the new entity', function (done) {
      var result = { title: 'Hello World' };

      client.on('error', done);
      client.on('entity', function (entity) {
        assert.deepEqual(entity.toObject(), result);
        done();
      });

      var action = { href: '/search' };
      var data = { terms: 'test' };
      client.submit(action, data);

      respond(requests.pop(), result);
    });

    it('should fire the callback', function (done) {
      var action = { href: '/search' };
      client.submit(action, {}, done);
      respond(requests.pop());
    });
  });
});

/**
 * Helper for fake XHR responses
 *
 * @param {FakeXMLHttpRequest} request  The fake xhr object.
 * @param {Object} data                 The JSON data to respond with.
 * @param {Object} headers              HTTP headers to set on the response.
 * @return {sinon.FakeXMLHttpRequest}
 */
function respond(request, data, headers) {
  if (!data) data = {}; // eslint-disable-line no-param-reassign
  if (!headers) headers = {}; // eslint-disable-line no-param-reassign
  if (!headers['Content-Type']) headers['Content-Type'] = 'application/vnd.siren+json';

  request.respond(200, headers, JSON.stringify(data));
  return request;
}
