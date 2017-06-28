// const { Axios } = require('axios');

// class Request {

// }

// var URL = require('url');
// var assert = require('assert');
// // var query = encodeURIComponent('query{hero{name}droid(id:"2000"){name}}');
// var query = encodeURIComponent(new Array(2048).fill(0).join(''));
// var byteLength = Buffer.byteLength(query);

// var MAX_BYTE_LENGTH = 2048;

// console.log(byteLength);

// assert.ok(byteLength <= MAX_BYTE_LENGTH, `Query length should not exceed ${MAX_BYTE_LENGTH} bytes.`)

// URL.format({
//   protocol: 'https:',
//   slashes: true,
//   auth: null,
//   host: 'localhost',
//   port: null,
//   hostname: 'localhost',
//   hash: null,
//   search: '?query=' + query,
//   query: 'query=' + query,
//   pathname: '/',
//   path: '/?query=' + query,
//   href: 'https://localhost/?query=' + query
// })


class C {
  apply(compiler) {
    console.log('c', this);
  }
}

class B {
  apply(compiler) {
    console.log('b', this);
  }
}

class A {
  constructor() {
    Object.setPrototypeOf(
      this,
      Object.assign(
        B.prototype,
        C.prototype
      )
    );
  }

  apply(compiler) {
    this.loggerPlugins.forEach((plugin) => {
      compiler.apply(new LoggerPlugin());
    });
  }
}

const path = require('path');
const webpack = require('webpack');

const compiler = webpack({
  entry: path.resolve('./index2.js'),
  output: {
    path: path.resolve('./dist'),
  },
  plugins: [
    // new A()
  ]
});

compiler.run((err, stats) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(
    require('util').inspect(
      stats.compilation.dependencyTemplates.keys(),
      { depth: null, colors: true }
    )
  );
})
