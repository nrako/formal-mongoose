### global describe, it, beforeEach ###

chai = require 'chai'
expect = chai.expect
Form = require '../lib/form'
mongoose = require 'mongoose'
Formal = require 'formal'
FieldTypes = Formal.FieldTypes
moment = require 'moment'
validate = require('mongoose-validator').validate

describe 'Formal-mongoose', ->

  schema = new mongoose.Schema
    email:
      type: String
      trim: true
      validate: validate
        message: 'Invalid email'
      ,'isEmail'
    username:
      type: String
      trim: true
      default: 'test'
    birthdate: Date
    name:
      family: String
      first: String

  schema.virtual('fullname').get ->
    return this.name.first + ' ' + this.name.family

  schema.virtual('age').get ->
    return moment(new Date).diff this.birthdate, 'years'

  schema.virtual('age').set (val) ->
    if isNaN val
      throw new TypeError 'invalid number for age'

    this.birthdate = moment(new Date).subtract('years', val).toDate()

  model = mongoose.model 'TestModel', schema

  it 'works with schema as argument', ->

    form = new Form schema, ['email', 'username', 'name.family']

    expect(form).to.be.an.instanceof Formal
    expect(Object.keys(form.paths).length).to.equal 3
    expect(form.path 'name.family').to.be.an.instanceof FieldTypes.String
    expect(form.get 'username').to.equal 'test'

    form.set
      username:
        '    test2   '

    expect(form.get 'username').to.equal 'test2'

  it 'supports model as schema argument', ->
    form = new Form model, ['email', 'username']

    expect(Object.keys(form.paths).length).to.equal 2

  it 'supports string as schema argument', ->
    form = new Form 'TestModel', ['name.family', 'name']

    expect(Object.keys(form.paths).length).to.equal 1

  it 'supports wildcard shortcut in path name', ->
    form = new Form schema, ['name.*']

    expect(Object.keys(form.paths).length).to.equal 2

  it 'supports validators from mongoose', (done) ->
    form = new Form schema, ['email']
    form.set
      email: 'dsjlkfaj'

    form.validate (err) ->
      expect(err.errors.email.type).to.equal 'Invalid email'
      done()

  it 'supports virtuals from mongoose', ->
    form = new Form schema, ['name.*', 'fullname', 'birthdate', 'age']

    age = 28

    form.set
      name:
        first: 'Marvin'
        family: 'Hagler'
      birthdate: moment().subtract('years', age).toDate()

    expect(form.get 'fullname').to.equal 'Marvin Hagler'
    expect(form.get 'age').to.equal age

    form.set
      age: 18

    expect(form.get 'age').to.equal 18

  it 'supports form() shorthand ', (done) ->
    middleware = Form schema, ['name.*', 'email']

    request =
      body:
        name:
          first: 'Marvin'
          family: 'Hagler'
        email: 'wrong email'

    response =
      locals: {}

    cb = ->
      form = request.form

      expect(form.get 'name.first').to.equal 'Marvin'
      expect(response.locals.form.email.error).to.be.a 'string'

      done()

    # app.post('/url', form.express, function (req, res) {...})
    middleware request, response, cb

  it 'can have 100% test coverage', ->
    fn = ->
      form = new Form null

    expect(fn).to.throw TypeError




