process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const config = require('../config/webpack.config.profile');
const path = require('path');
const fs = require('fs');
const profiler = require('v8-profiler');
const CleanPlugin = require('clean-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const AggressiveSplittingPlugin = require('webpack/lib/optimize/AggressiveSplittingPlugin');
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

process.on('warning', (warning) => {
  console.log(warning.name);
  console.log(warning.message);
  console.log(warning.stack);
});

class ProfilePlugin {

  constructor(id, UglifyJsPlugin) {
    this.id = id;
    this.plugin = new UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false,
      },
      output: {
        comments: false,
      },
      sourceMap: true,
    });
  }

  apply(compiler) {
    const outPath = process.cwd() + '/'
        + this.id
        + '.optimize-chunk-assets.cpuprofile';

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('additional-assets', (callback) => {
        console.log('additional-assets');

        const files = compilation.additionalChunkAssets || [];
        for (let i = compilation.chunks.length - 1; i > -1; --i) {
          Array.prototype.push.apply(files, compilation.chunks[i].files);
        }

        console.log('files length', files.reduce((_files, file) => {
          if (!_files.includes(file)) {
            _files.push(file);
          }
          return _files;
        }, []).length);

        profiler.startProfiling('optimize-chunk-assets', true);
        console.time(this.id + ' ' + 'optimize-chunk-assets');
        callback();
      });

      compilation.plugin('after-optimize-chunk-assets', (chunks) => {
        console.timeEnd(this.id + ' ' + 'optimize-chunk-assets');
        const profile = profiler.stopProfiling('optimize-chunk-assets');
        profile.export((err, result) => {
          console.log('profile.export()');
          fs.writeFile(outPath, result, 'utf8', (_err) => {
            console.log('fs.writeFileAsync()', outPath);
            profile.delete();
          })
        });
      });
    });

    new AggressiveSplittingPlugin({
      minSize: 20000,
      maxSize: 40000
    }).apply(compiler);
    // new AggressiveSplittingPlugin().apply(compiler);
    // new CommonsChunkPlugin({
    //   name: 'common',
    //   minChunks: 2
    // }).apply(compiler);
    new CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }).apply(compiler);
    // new ModuleConcatenationPlugin().apply(compiler)
    new this.plugin.apply(compiler);
  }
}

function build(id, UglifyJsPlugin) {
  return new Promise((resolve, reject) => {
    console.log('Creating an optimized production build...');
    const distDir = path.resolve('./dist', id);
    const cfg = Object.assign({}, config)
    cfg.output.path = distDir;
    const compiler = webpack(cfg);

    new CleanPlugin([distDir], { verbose: false }).apply(compiler);
    new ProfilePlugin(id, UglifyJsPlugin).apply(compiler);

    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      resolve(stats);
    });
  });
}

function reRequire(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  const _module = require(modulePath);
  return _module.default || _module;
}

const oldPlugin = reRequire('./forEach-uglifyjs-webpack-plugin');
const newPlugin = reRequire('./for-uglifyjs-webpack-plugin');

Promise.resolve()
  .then(build.bind(null, 'old0', oldPlugin))
  // .then(build.bind(null, 'new1', newPlugin))
  // .then(build.bind(null, 'new2', newPlugin))
  .then(() => null)
  // .then(console.log)
  .then(build.bind(null, 'new0', newPlugin))
  // .then(build.bind(null, 'old1', oldPlugin))
  // .then(build.bind(null, 'old2', oldPlugin))
  .then(() => null)
  // .then(console.log)
  .catch(console.error);
