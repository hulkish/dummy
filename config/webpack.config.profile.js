'use strict';

const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const paths = { dotenv: '/Users/shargrove/dev/repos/dummy/.env',
  appBuild: '/Users/shargrove/dev/repos/dummy/dist',
  appPublic: '/Users/shargrove/dev/repos/dummy/public',
  appHtml: '/Users/shargrove/dev/repos/dummy/public/index.html',
  appIndexJs: '/Users/shargrove/dev/repos/dummy/src/index.js',
  appPackageJson: '/Users/shargrove/dev/repos/dummy/package.json',
  appSrc: '/Users/shargrove/dev/repos/dummy/src',
  yarnLockFile: '/Users/shargrove/dev/repos/dummy/yarn.lock',
  testsSetup: '/Users/shargrove/dev/repos/dummy/src/setupTests.js',
  appNodeModules: '/Users/shargrove/dev/repos/dummy/node_modules',
  publicUrl: undefined,
  servedPath: '/'
};

// const publicPath = paths.servedPath;
// const publicUrl = publicPath.slice(0, -1);

module.exports = {
  bail: true,
  cache: false,
  devtool: 'source-map',
  entry: paths.appIndexJs,
  output: {
    path: paths.appBuild,
  },
  resolve: {
    unsafeCache: false,
    extensions: ['.js', '.json', '.jsx'],
    alias: {
      'react-native': 'react-native-web',
    }
  },
  resolveLoader: {
    unsafeCache: false
  },
  module: {
    unsafeCache: false,
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
      },
    ],
  }
};
