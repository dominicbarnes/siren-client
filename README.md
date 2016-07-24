# siren-client

> A specialized [siren](https://github.com/kevinswiber/siren) API client.

[![npm version](https://img.shields.io/npm/v/siren-client.svg)](https://www.npmjs.com/package/siren-client)
[![npm dependencies](https://img.shields.io/david/dominicbarnes/siren-client.svg)](https://david-dm.org/dominicbarnes/siren-client)
[![npm dev dependencies](https://img.shields.io/david/dev/dominicbarnes/siren-client.svg)](https://david-dm.org/dominicbarnes/siren-client#info=devDependencies)
[![build status](https://img.shields.io/travis/dominicbarnes/siren-client.svg)](https://travis-ci.org/dominicbarnes/siren-client)

## Usage

This particular client is built in a very specialized fashion. It operates
by only working with a single entity at a time, more or less as a _stream_.

This makes it more suitable for use in applications that are going to make use
entirely of a hypermedia-driven interface. (rather than as an ad-hoc client)

As such, it does *not* work with callbacks. Instead, the client instance is an
emitter that emits events when a new entity is fetched. (or when an action is
successfully complete)

```js
var Siren = require('siren-client');
var client = new Siren();

client.on('error', function (err) {
  // these are HTTP errors, not application errors
  console.error(err);
});

client.on('entity', function (entity) {
  // an `Entity` instance, see docs below
  console.log(entity);
});

// retrieves the given url as the entry point for the api you are working with.
client.get('http://siren.example.com/');
```

## API

### Client(href) *(constructor)*

Creates a new client instance, if `href` is passed, it will use that as the
entry point and starts navigating. (make sure to attach to the `entity` and
`error` events)

### Client#get(url, [callback])

This is how you set the entry point for the API you are interacting with. It
will fetch the given URL and use that as the first/new entity.

If `callback` is provided, it will be invoked before either `error` or `entity`
is emitted.

### Client#follow(link, [callback])

This follows the given `link` and uses the response as the next entity.

The `link` param can either be a `String` url, or a link `Object` given by a
siren API.

If `callback` is provided, it will be invoked before either `error` or `entity`
is emitted.

### Client#submit(action, data, [callback])

Submits the `action` with accompanying `data` to the API.

The `action` param is the action `Object` given by a siren API.

The `data` param is an object of key-value pairs that should be serialized and
sent as the body. The easiest way to accomplish this is to use a well-formed
HTML `<form>` along with something like [form-serialize](https://github.com/dominicbarnes/form-serialize)
to generate the object.

If `callback` is provided, it will be invoked before either `error` or `entity`
is emitted.

### Client: `entity(entity, href)` *(event)*

Fired after an entity has been loaded. (also after an `action` has been
processed successfully) The passed `entity` is an instance of `Entity`. (API
documented below)

### Client: `error(err, href)` *(event)*

Fired for errors that happen trying to send/receive data. The raw `err` is
passed so you can respond accordingly.

**NOTE:** Generally, these are **not** application errors. These will likely be
HTTP failures, rejected cross-origin requests, etc. However, a non-siren
response will also emit this error. (in case your server has not started
responding with siren for a specific route)


### Entity(data) *(constructor)*

Wrapper for siren entity objects, which offers convenient APIs for finding
links/entities/actions within the larger entity.

### Entity#title()

Retrieves the `title` attribute for the entity. If not defined, it will return
an empty string.

### Entity#properties()

Retrieves a copy of the `properties` object. If none were defined, it will
simply return an empty object.

### Entity#class()

Retrieves a copy of the `class` array. This always returns an `Array`, even
if that means it is empty.

### Entity#rel()

Retrieves a copy of the `rel` array. (used for sub-entities) This always
returns an `Array`, even if that means it is empty.

### Entity#entity([search])

Retrieves the first entity (wrapped as an `Entity` instance) that matches the
optional `search` criteria. The `search` parameter can be specified as:

- a `String` used to search for entity with a matching `rel`
- an `Object` with either a `rel` or `class` key to match against
- a `Function` that should return `true` for the correct entity

If none is found, this will return `null`.

### Entity#entities([search])

Retrieves an `Array` of entities (wrapped as `Entity` instances) that match
the optional `search` criteria. The `search` parameter can be specified as:

- a `String` used to search for entity with a matching `rel`
- an `Object` with either a `rel` or `class` key to match against
- a `Function` that should return `true` for the correct entity

This will return an `Array`, containing all the matching actions. (even if that
means it is empty)

### Entity#link([search])

Retrieves the first link that matches the optional `search` criteria. The
`search` parameter can be specified as:

- a `String` used to search for link with a matching `rel`
- an `Object` with either a `rel` or `class` key to match against
- a `Function` that should return `true` for the correct link

If none is found, this will return `null`.

### Entity#links([search])

Retrieves an `Array` of links that match the optional `search` criteria. The
`search` parameter can be specified as:

- a `String` used to search for link with a matching `rel`
- an `Object` with either a `rel` or `class` key to match against
- a `Function` that should return `true` for the correct link

This will return an `Array`, containing all the matching links. (even if that
means it is empty)

### Entity#action([search])

Retrieves the first action that matches the optional `search` criteria. The
`search` parameter can be specified as:

- a `String` used to search for action with a matching `name`
- an `Object` with either a `name` or `class` key to match against
- a `Function` that should return `true` for the correct action

If none is found, this will return `null`.

### Entity#actions([search])

Retrieves an `Array` of actions that match the optional `search` criteria. The
`search` parameter can be specified as:

 - a `String` used to search for action with the same `name`
 - an `Object` with either a `name` or `class` key to match against
 - a `Function` that should return `true` for the correct action

This will return an `Array`, containing all the matching actions. (even if that
means it is empty)
