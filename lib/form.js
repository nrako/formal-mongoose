/*!
 * Module dependencies.
 */

var Formal = require('formal'),
    mongoose = require('mongoose'),
    util = require('util'),
    mpath = require('mpath');

/**
 * Form constructor.
 *
 * ####Example:
 *     var Form = require('formal-mongoose'),
 *         User = mongoose.model('User'
 *
 *     var form = new Form(User, ['email', 'username'], options);
 *
 * ####Options (inherited from Formal):
 *
 *     {
 *       dataSources: ['body', 'query', 'params'],
 *       autoTrim: false,  // automatically add trim options to fields
 *       autoLocals: true  // form.middleware adds form.export + validation results to res.locals
 *     }
 *
 * ####Note:
 *
 * Provides an alternative factory returning a route-middleware for express and connect
 *
 *     app.post('/url',
 *       // sames as: (new Form(User, ['username', 'email']).middleware()
 *       form(User, ['username', 'email']),
 *       function (req, res) {
 *         console.log(req.form); // instanceof Form
 *         console.log(res.locals.form.fieldA); // {value: '...', error: '...', data: {...}}
 *       }
 *     );
 *
 * @param {Object} schema the mongoose schema or model with a schema property
 * @param {Array} fields  array of strings path to import from the mongoose schema
 * @param {Object} options  same as options than for Formal
 * @inherits Formal https://github.com/nrako/formal
 * @api public
 */

function Form (schema, fields, options) {
  if (!(this instanceof Form))
    return (new Form(schema, fields, options)).middleware();

  fields = [].concat(fields);

  var self = this;

  if (schema && schema.schema && Form.quackLikeAMongoose(schema.schema)) {
    schema = schema.schema;
  } else if (!schema || !Form.quackLikeAMongoose(schema))
    throw new TypeError('Invalid schema argument it must be a mongoose schema or a mongoose model');

  this.schema = schema;

  Formal.call(this, {}, options);

  fields.forEach(function(path) {
    self.addPath(path);
  });
}

util.inherits(Form, Formal);

/*!
* ignore
*
* Duck typing replacement for "schema instanceof mongoose.schema"
*/
Form.quackLikeAMongoose = function (schema) {
  var methods = ['path', 'pathType', 'virtualpath'],
      ml = methods.length,
      props = ['tree'],
      pl = props.length;

  while (pl--) {
    if (typeof schema[props[pl]] !== 'object')
      return false;
  }
  while (ml--) {
    if (typeof schema[methods[ml]] !== 'function')
      return false;
  }

  return true;
};


/**
 * Add an existing path from the schema
 *
 * ####Note:
 * Allows path to end with a wildcard * to import direct children example:
 *
 *      // to import name.firstname and name.lastname
 *      form.addPath('name.*');
 *
 * @param {String} path The path to be imported
 * @api public
 */
Form.prototype.addPath = function (path) {
  var self = this;
  if (this.schema.pathType(path) === 'virtual') {
    var virtual = this.schema.virtualpath(path);
    virtual.getters.forEach(function (getter) {
      self.virtual(virtual.path, virtual.options).get(getter);
    });
    virtual.setters.forEach(function (setter) {
      self.virtual(virtual.path, virtual.options).set(setter);
    });
    return;
  }

  // if path.end.with.*
  if (/\.\*$/.test(path)) {
    var prefix = path.replace(/\.\*/, '');
    var obj = mpath.get(prefix, this.schema.tree);
    var keys = Object.keys(obj);
    keys.forEach(function (key) {
      self.addPath(prefix + '.' + key);
    });
  }

  var field = this.schema.path(path);
  if (field)
    this.path(path, field.options);
};


module.exports = Form;
