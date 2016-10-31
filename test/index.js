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
        'layout/index.jsx'
      ]
    },
    {
      name: 'page',
      files: [
        'page/index.jsx'
      ]
    }
  ],
  assets: {
    'layout/index.jsx': {
      source() {
        return layoutSource;
      }
    },
    'page/index.jsx': {
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
        () => expect(compilation).property('assets').to.not.have.property('page/index.jsx')
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
        () => expect(compilation).property('assets').to.have.property('index.html')
      );
    });

  });

});
