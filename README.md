# Formal-mongoose [![Build Status](https://travis-ci.org/nrako/formal-mongoose.png?branch=master)](https://travis-ci.org/nrako/formal-mongoose) [![Coverage Status](https://coveralls.io/repos/nrako/formal-mongoose/badge.png?branch=master)](https://coveralls.io/r/nrako/formal) [![Dependency Status](https://gemnasium.com/nrako/formal-mongoose.png)](https://gemnasium.com/nrako/formal-mongoose)

Formal + Mongoose = DRY! Simple solution to define a form with validation (and more) from a mongoose schema.

## Example

```javascript
var Form = require('formal-mongoose'),
    model = mongoose.model('User');

var form = new Form(model, ['name.*', 'email', 'age']);

form.field({
  tos: {
    type: Boolean,
    default: false,
    validate: function(val) {
      return val === true;
    }
  }
});

form.set({
  name: {family: 'Martinez'},
  'name.first': 'José Luis Chavez',
  age: 12,
  tos: true
});

form.validate(function (err) {
  console.log(err); // missing required email, age to low
  console.log(form.get('name.first.0')); // José
  console.log(form.export());
});
```

## Install
`npm install formal-mongoose --save`

## Summary

Extend [`formal`](https://github.com/nrako/formal) to provides fast and easy way to define a form from an existing schema. The best way to don't repeat yourself!

## API

For the inherited prototype see the [Formal API](http://nrako.github.io/formal).

### new Form(schema:Object|String, fields:Array, options:Object):instance

`schema` mongoose model or schema or the model name  
`fields` array of strings path to import from the mongoose schema  
`options` object of options identical to Formal

```javascript
var Form = require('formal-mongoose');
var form = new Form(mongoose.model('User'), ['username', 'pasword']);
```

For connect and express the alternative factory method can be used as a quick helper to
create a new instance and return form.middleware() to monkey patch the request and
response object.

```javascript
app.post('/url',
  // sames as (new Form({...})).middleware()
  form(schema, ['username', 'password']),
  function (req, res) {
    console.log(req.form.data);
    console.log(res.locals.form.username.value);
  }
);
```

### form.addPath(path:String):void

Add a path from the schema.

#### Notes:
Allows path to end with a wildcard * to import direct children example:

```javascript
// to import name.firstname and name.lastname
form.addPath('name.*')
```

## Test
`npm test`  
[Mocha Coverage](http://nrako.github.io/formal-mongoose/coverage.html)  
`npm run-script coverage`  
[On Coveralls.io](https://coveralls.io/r/nrako/formal-mongoose)

All tests are in Coffee-script, hence easy to read! Provides a great way to understand the API ;)

## LICENSE

MIT
