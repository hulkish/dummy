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
        + '.uglifyjs-webpack-plugin.cpuprofile';

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        const files = compilation.additionalChunkAssets || [];
        for (let i = compilation.chunks.length - 1; i > -1; --i) {
          Array.prototype.push.apply(files, compilation.chunks[i].files);
        }

        console.log(this.id, 'files length', files.reduce((_files, file) => {
          if (!_files.includes(file)) {
            _files.push(file);
          }
          return _files;
        }, []).length);


        console.log(this.id, 'profiler.startProfiling()');
        profiler.startProfiling(this.id, true);
        console.time(this.id);
        callback();
      });

      compilation.plugin('after-optimize-chunk-assets', (chunks) => {
        console.timeEnd(this.id);
        console.log(this.id, 'profiler.stopProfiling()');
        const profile = profiler.stopProfiling(this.id);
        profile.export((err, result) => {
          console.log(this.id, 'profile.export()');
          fs.writeFileSync(outPath, result, 'utf8');
          console.log(this.id, 'profile saved:', outPath);
            profile.delete();
        });
      });
    });

    new AggressiveSplittingPlugin().apply(compiler);
    new CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }).apply(compiler);
    this.plugin.apply(compiler);
    // new ModuleConcatenationPlugin().apply(compiler)
  }
}

function build(id, UglifyJsPlugin) {
  return new Promise((resolve, reject) => {
    id += '_node@' + process.version;
    console.log(id, 'compile...');
    const cfg = Object.assign({}, config)
    cfg.output.path = path.resolve('./dist', id);
    const compiler = webpack(cfg);

    new CleanPlugin(['dist'], { verbose: false }).apply(compiler);
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

const untouched_UglifyjsPlugin = reRequire('uglifyjs-webpack-plugin');
const forEach_WeakSet_UglifyjsPlugin = reRequire('./forEach_WeakSet-uglifyjs-webpack-plugin');
const for_UglifyjsPlugin = reRequire('./for-uglifyjs-webpack-plugin');
const for_WeakSet_UglifyjsPlugin = reRequire('./for_WeakSet-uglifyjs-webpack-plugin');

Promise.resolve()
  .then(build.bind(null, 'untouched', untouched_UglifyjsPlugin))
  // .then(build.bind(null, 'untouched', untouched_UglifyjsPlugin))
  // .then(build.bind(null, 'untouched1', untouched_UglifyjsPlugin))
  // .then(console.log)
  .then(build.bind(null, 'forEach_WeakSet', forEach_WeakSet_UglifyjsPlugin))
  // .then(build.bind(null, 'forEach_WeakSet1', forEach_WeakSet_UglifyjsPlugin))
  // .then(build.bind(null, 'forEach_WeakSet2', forEach_WeakSet_UglifyjsPlugin))
  // .then(console.log)
  .then(build.bind(null, 'for', for_UglifyjsPlugin))
  // .then(build.bind(null, 'for1', for_UglifyjsPlugin))
  // .then(build.bind(null, 'for2', for_UglifyjsPlugin))
  // .then(console.log)
  .then(build.bind(null, 'for_WeakSet', for_WeakSet_UglifyjsPlugin))
  // .then(build.bind(null, 'for_WeakSet1', for_WeakSet_UglifyjsPlugin))
  // .then(build.bind(null, 'for_WeakSet2', for_WeakSet_UglifyjsPlugin))
  // .then(console.log)
  .catch(console.error);
