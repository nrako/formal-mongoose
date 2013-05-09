/*jshint browser: false, node: true */
var path = require('path'),
    fs = require('fs'),
    glob = require('glob');


// This is the main application configuration file.  It is a Grunt
// configuration file, which you can learn more about here:
// https://github.com/cowboy/grunt/blob/master/docs/configuring.md
module.exports = function(grunt) {
  'use strict';

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // The jshint option
    jshint: { // grunt-contrib-jshint
      all: ['lib/**/*.js', 'test/**/*.js', 'Gruntfile.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    jsvalidate: { // grunt-jsvalidate
      files: ['lib/**/*.js', 'test/**/*.js']
    },

    simplemocha: { // grunt-simple-mocha
      options: {
        compilers: 'coffee:coffee-script',
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: { src: ['test/**/*.spec.coffee'] }
    },

    mochacov: { // grunt-mocha-cov
      coveralls: {
        options: {
          coveralls: {
            serviceName: 'travis-ci',
            repoToken: 'SCSQw4sOkzPD0XY0NKOIUscVZ3RGJ9cMD'
          }
        }
      },
      coverage: {
        options: {
          coverage: true,
          reporter: 'html-cov'
        }
      },
      test: {
        options: {
          reporter: 'spec'
        }
      },
      all: { src: ['test/**/*.spec.coffee'] },
      options: {
        ui: 'bdd',
        timeout: 3000,
        ignoreLeaks: false,
        compilers: ['coffee:coffee-script']
      }
    },

    clean: { // grunt-contrib-clean
      docs: ['_gh-pages/dox/', '_gh-pages/plato/']
    },

    plato: { // grunt-plato
      def: {
        options : {
          jshint : grunt.file.readJSON('.jshintrc')
        },
        files: {
          '_gh-pages/plato': ['lib/**/*.js']
        }
      }
    },

    dox: { // grunt-dox
      options: {
        title: 'Formal'
      },
      files: {
        src: ['lib/form.js', 'lib/field/field.js', 'lib/error.js', 'lib/virtualtype.js'],
        dest: '_gh-pages/dox'
      }
    }

  });

  // Grunt task for development
  grunt.registerTask('default', ['jsvalidate']);

  // Run server-side tests
  grunt.registerTask('test', ['jshint', 'jsvalidate', 'simplemocha']);
  grunt.registerTask('travis', ['mochacov:test']);

  // Generates the docs api (dox) and the plato report
  grunt.registerTask('gh-pages', ['clean:docs', 'plato', 'dox']);
};
