
var assert = require('component/assert');
var Client = require('../lib/client');

describe('Client()', function () {
  it('should be an emitter', function () {
    assert(Client.prototype.on, 'should have an on method');
  });

  // TODO: test http interface, need a mocking library
});
