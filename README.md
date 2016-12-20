# static-react-render-webpack-plugin

Render static sites with `React` and `Webpack`.

## Installation

    npm install --save-dev static-react-render-webpack-plugin

## Usage

`webpack.config.js`
```js
const path = require('path');
const StaticReactRenderWebpackPlugin = require('static-react-render-webpack-plugin');

module.exports = {
  
  context: path.join(__dirname, 'src'),

  entry: {
    layout: './src/layout/index.jsx',
    productList: './src/pages/product-list/index.jsx',
    productPage: './src/pages/product-page/index.jsx'
  },
  
  output: {
    path: path.join(__dirname, 'dest'),
    publicPath: '/',
    libraryTarget: 'commonjs' /* required so the plugin can load your components */
  },
    
  target: 'node', /* required so the plugin can evaluate your components on node */
  
  /* ...configure loaders, resolvers, etc... */
  
  plugins: [
    new StaticReactRenderWebpackPlugin({
      layout: 'layout',
      pages: [
        'productList',
        'productPage'
      ]
    })
  ]
  
};
```

`./src/fetchProducts.js`
```js
import fetch from 'node-fetch';

export default () => fetch('http://example.com/products.json')
  .then(response => response.json())
;

```

`./src/layout/index.jsx` - wraps pages with a common header and footer
```js
export default ({children}) => (
  <html>
    <head></head>
    <body>{children}</body>
  </html>
);
```

`./src/pages/product-list/index.jsx` - creates a single HTML file listing all products
```js
import fetchProducts from '../../fetchProducts';

export default class ProductList extends React.Component {
  
  static getPath = ({product}) => `products/${product.slug}/index.html`;
  
  static getProps = () => fetchProducts()
    .then(products => ({products}))
  ;

  render() {
    const {product} = this.props;
    return (
      <div>
        <h1>Products</h1>
        <ul>
          {products.map(product => (
            <li>
              <a href={`products/${product.slug}/`}>{product.name}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
    
}
import fetchProducts from '../../fetchProducts';

export const getPath = () => 'products/index.html';

export const getProps = () => fetchProducts()
  .then(products => ({products}))
;

export default ({products}) => (
  <div>
    <h1>Products</h1>
    <ul>
      {products.map(product => (
        <li>
          <a href={`products/${product.slug}/`}>{product.name}</a>
        </li>
      ))}
    </ul>
  </div>
);
```
`./src/pages/product-page/index.jsx` - creates multiple HTML files describing each individual product
```js
import fetchProducts from '../../fetchProducts';

export default class ProductPage extends React.Component {
  
  static getPath = ({product}) => `products/${product.slug}/index.html`;
  
  static getProps = () => fetchProducts()
    .then(products => products.map(product => ({product})))
  ;

  render() {
    const {product} = this.props;
    return (
      <div>
        <h1>{product.name}</h1>
        <h2>{product.price}</h2>
      </div>  
    );
  }
    
}

```

## Options

##### layout

The name of the layout chunk.

> Required. A `string`.

##### pages

The names of the page chunks.

> Required. An `array` of `string`s.

##### getLayoutProps

A function modifying the props passed to the layout component.

> Optional. A `function(props, context) : object` where:
- `props` is an `object`
- `context` is an `object` containing:
    - `pageChunk`
    - `layoutChunk`
    - `compilation`
    
##### getPageProps

A function modifying the props passed to the page component.

> Optional. A `function(props, context) : object` where:
- `props` is an `object`
- `context` is an `object` containing:
    - `pageChunk`
    - `layoutChunk`
    - `compilation`
    
# Change log

## 0.3.1

- fix: remove unnecessary log
- fix: report errors

## 0.3.0

- break: moved `.getPath()` and `.getProps()` to the component