# siren-client

> A specialized siren API client.

## Usage

This particular client is built in a very specialized fashion. It operates
by only working with a single entity at a time.

This makes it more suitable for use in applications that are going to make
use entirely of a hypermedia-driven interface. (rather than as an ad-hoc
client for a siren API)

As such, it does _not_ work with callbacks. Instead, the client instance is
an emitter that emits events when a new entity is fetched. (or when an action
is complete)

```js
var Siren = require('siren-client');
var client = new Siren();

client.on('error', function (err) {
  // these are HTTP errors, not application errors
  console.error(err);
});

client.on('entity', function (entity) {
  // this object is a wrapped instance of the data returned by the server,
  // giving it helpers for traversing the links/actions/etc of the entity
  console.log(entity);
});

// starts the client at the given url, from there you can call this method
// as you navigate through the api
client.get('http://localhost/api');
```

## API

### Client() *(constructor)*

Creates a new client instance, this is just a simple `Emitter` right now.

### Client#get(url)

Retrieves the resource at the given `url` and processes it as a siren entity.
It does not accept a callback, you currently need to subscribe to the `entity`
event in order to process this navigation.

### Client#action(url, method, data)

Issues the given `action` against the API.

**NOTE:** This is very low-level at the moment, and does not offer much sugar
when working with the siren object. (this will likely be made simpler in future
iterations)

**NOTE:** This does not currently support alternate `enctype` options, it only
supports JSON at the time. (this will be added in future iterations)

### Client: `error(err)` *(event)*

Fired for errors that happen trying to send/receive data. The raw `err` is passed
so you can respond accordingly.

Currently, when an error like this happens, it is likely your application will
simply try again, but that will be up to your code to handle.

**NOTE:** These are **not** application errors. These will likely be HTTP failures,
rejected cross-origin requests, etc.

### Client: `entity(entity)` *(event)*

Fired after an entity has been loaded. (also after an `action` has been processed
successfully) The passed `entity` is an instance of `Entity`. (API documented below)

### Entity(data) *(constructor)*

Wrapper for siren entity objects. It offers some limited sugar for interacting
with the entity data. In the future, this will likely become it's own module as
it's API is fleshed out more.

This is the wrapper that is passed to the `entity` event.

### Entity#actions *(getter)*

Retrieves a copy of the `actions` array. Currently, it only returns raw objects, but
this will likely be converted to some sort of `Actions` object in the future.

If none were defined, it will simply return an empty array.

### Entity#class *(getter)*

Retrieves a copy of the `class` array.

If none were defined, it will simply return an empty array.

### Entity#links *(getter)*

Retrieves a copy of the `entities` array. This converts the raw objects into an array
of `Entity` instances.

If none were defined, it will simply return an empty array.

### Entity#links *(getter)*

Retrieves a copy of the `links` array. Currently, it only returns raw objects, but
this will likely be converted to some sort of `Links` object in the future.

If none were defined, it will simply return an empty array.

### Entity#properties *(getter)*

Retrieves a copy of the `properties` object.

If none were defined, it will simply return an empty object.

### Entity#title *(getter)*

Retrieves the `title` attribute for the entity.

If not defined, it will return an empty string.
