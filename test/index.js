'use strict';
const sinon = require('sinon');
const expect = require('chai').expect;
const checkAndStop = require('async-catch').checkAndStop;
const Plugin = require('..');

const layoutSource = `
const React = require('react');
module.exports = {
  default: props => React.createElement('html', {}, React.createElement('body', {children: props.children}))
};`;

const pageSource = `
const React = require('react');
module.exports = {
  getPath: () => 'index.html',
  default: props => React.createElement('h1', {}, 'Hello World!')
};`;


const getPluginHandlers = plugin => {
  let handlers = {};

  const fakeCompiler = {

    plugin(name, handler) {
      handlers[name] = handler;
    }

  };

  plugin.apply(fakeCompiler);

  return handlers;
};

const createCompilation = () => ({
  chunks: [
    {
      name: 'layout',
      files: [
        'layout/index.js'
      ]
    },
    {
      name: 'page',
      files: [
        'page/index.js'
      ]
    }
  ],
  assets: {
    'layout/index.js': {
      source() {
        return layoutSource;
      }
    },
    'page/index.js': {
      source() {
        return pageSource;
      }
    }
  }
});

describe('static-react-render-webpack-plugin', () => {

  it('should remove the page asset when the plugin runs successfully', done => {

    const handlers = getPluginHandlers(new Plugin({
      layout: 'layout',
      pages: ['page']
    }));

    const compilation = createCompilation();

    handlers.emit(compilation, error => {
      checkAndStop(done)(
        error,
        () => expect(compilation).property('assets').to.not.have.property('page/index.js')
      );
    });

  });

  it('should create the page asset when the plugin runs successfully', done => {

    const handlers = getPluginHandlers(new Plugin({
      layout: 'layout',
      pages: ['page']
    }));

    const compilation = createCompilation();

    handlers.emit(compilation, error => {
      checkAndStop(done)(
        error,
        () => {
          expect(compilation).property('assets').to.have.a.property('index.html');
          expect(compilation).property('assets').property('index.html').to.have.a.property('size').to.be.a('function');
          expect(compilation).property('assets').property('index.html').to.have.a.property('source').to.be.a('function');
        }
      );
    });

  });

});
