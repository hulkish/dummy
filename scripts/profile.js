process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const instrument = require('./instrument-webpack');
const isPlainObject = require('lodash/isPlainObject');
const debug = require('debug');
const path = require('path');
// const profiler = require('v8-profiler');
// const fs = require('fs');

// require('source-map-support').install({
//   environment: 'node'
// });
//

const log = {
  construct: debug('profile:construct'),
  get: debug('profile:get'),
  set: debug('profile:set'),
  invoke: debug('profile:invoke'),
};

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
    // const outPath = process.cwd() + '/'
    //     + this.id
    //     + '.uglifyjs-webpack-plugin.cpuprofile';

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        const files = [...(compilation.additionalChunkAssets || [])];
        for (let i = 0, len = compilation.chunks.length; i < len; i++) {
          Array.prototype.push.apply(files, compilation.chunks[i].files);
        }

        log.invoke(this.id, 'additionalChunkAssets', compilation.additionalChunkAssets.length);
        log.invoke(this.id, 'total', files.length);

        // const filesStats = files.reduce((result, file) => {
        //   if (result.uniq.includes(file)) {
        //     log.invoke(file)
        //     result.extra.push(file);
        //   } else {
        //     result.uniq.push(file);
        //   }
        //   return result;
        // }, { uniq: [], extra: []});

        // log.invoke(this.id, 'difference', files.length - filesStats.uniq.length);
        // log.invoke(this.id, 'unique files length', filesStats.uniq.length);
        // log.invoke(this.id, 'unique files', filesStats.uniq.join());
        // log.invoke(this.id, 'extra files length', filesStats.extra.length);
        // log.invoke(this.id, 'extra files', filesStats.extra.join());


        // log.invoke(this.id, 'profiler.startProfiling()');
        // profiler.startProfiling(this.id, true);
        console.time(this.id);
        callback();
      });

      compilation.plugin('after-optimize-chunk-assets', (chunks) => {
        console.timeEnd(this.id);
        // log.invoke(this.id, 'profiler.stopProfiling()');
        // const profile = profiler.stopProfiling(this.id);
        // profile.export((err, result) => {
        //   log.invoke(this.id, 'profile.export()');
        //   fs.writeFileSync(outPath, result, 'utf8');
        //   log.invoke(this.id, 'profile saved:', outPath);
        //     profile.delete();
        // });
      });
    });


    // const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
    const AggressiveSplittingPlugin = require('webpack/lib/optimize/AggressiveSplittingPlugin');
    // const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

    // new CommonsChunkPlugin({
    //   name: 'manifest',
    //   minChunks: Infinity
    // }).apply(compiler);
    //
    new AggressiveSplittingPlugin().apply(compiler);
    this.plugin.apply(compiler);
    // new ModuleConcatenationPlugin().apply(compiler)
  }
}

process.on('warning', (warning) => {
  log.invoke(warning.name);
  log.invoke(warning.message);
  log.invoke(warning.stack);
});

function build(webpack, id, {
  UglifyJsPlugin,
  modulePath,
  originalPath
}) {
  return new Promise((resolve, reject) => {
    const CleanPlugin = require('clean-webpack-plugin');
    const config = require('../config/webpack.config.profile');

    id += '_node@' + process.version;
    const pkg = require(originalPath + '/package.json');
    log.invoke(id, `${pkg.name}@${pkg.version}`, modulePath);
    log.invoke(id, 'compile...');
    const cfg = Object.assign({}, config)
    cfg.output.path = path.resolve('./dist', id);
    cfg.entry = path.resolve('./src/App0');
    const compiler = webpack(cfg);

    new CleanPlugin(['dist'], {
      verbose: false
    }).apply(compiler);
    new ProfilePlugin(id, UglifyJsPlugin).apply(compiler);

    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      resolve(stats);
    });
  });
}

function reRequire(originalPath) {
  const modulePath = require.resolve(originalPath);
  const _module = require(modulePath);
  return {
    originalPath,
    modulePath,
    UglifyJsPlugin: _module.default || _module
  };
}

async function profile() {
  try {
    const webpack = await instrument();

    const untouched_UglifyjsPlugin = reRequire('../node_modules/uglifyjs-webpack-plugin');
    // const Horton_UglifyjsPlugin = reRequire('../../horton-uglifyjs-webpack-plugin');
    // const Parallel_UglifyjsPlugin = reRequire('../../webpack-parallel-uglify-plugin');
    // const Parallel_UglifyjsPlugin = reRequire('webpack-parallel-uglify-plugin');
    // const forEach_WeakSet_UglifyjsPlugin = reRequire('./forEach_WeakSet-uglifyjs-webpack-plugin');
    // const for_UglifyjsPlugin = reRequire('./for-uglifyjs-webpack-plugin');
    // const for_WeakSet_UglifyjsPlugin = reRequire('./for_WeakSet-uglifyjs-webpack-plugin');

    await Promise.resolve()
      .then(build.bind(null, webpack, 'untouched', untouched_UglifyjsPlugin))
      // .then(build.bind(null, 'untouched', untouched_UglifyjsPlugin))
      // .then(build.bind(null, 'untouched1', untouched_UglifyjsPlugin))
      // .then(log)
      // .then(build.bind(null, webpack, 'Horton', Horton_UglifyjsPlugin))
      // .then(build.bind(null, 'Horton', Horton_UglifyjsPlugin))
      // .then(build.bind(null, 'Horton', Horton_UglifyjsPlugin))
      // .then(log)
      // .then(build.bind(null, webpack, 'Parallel', Parallel_UglifyjsPlugin))
      // .then(build.bind(null, 'Parallel', Parallel_UglifyjsPlugin))
      // .then(build.bind(null, 'Parallel', Parallel_UglifyjsPlugin))
      // .then(log)
      // .then(build.bind(null, 'forEach_WeakSet', forEach_WeakSet_UglifyjsPlugin))
      // .then(build.bind(null, 'forEach_WeakSet1', forEach_WeakSet_UglifyjsPlugin))
      // .then(build.bind(null, 'forEach_WeakSet2', forEach_WeakSet_UglifyjsPlugin))
      // .then(log)
      // .then(build.bind(null, 'for', for_UglifyjsPlugin))
      // .then(build.bind(null, 'for1', for_UglifyjsPlugin))
      // .then(build.bind(null, 'for2', for_UglifyjsPlugin))
      // .then(log)
      // .then(build.bind(null, 'for_WeakSet', for_WeakSet_UglifyjsPlugin))
      // .then(build.bind(null, 'for_WeakSet1', for_WeakSet_UglifyjsPlugin))
      // .then(build.bind(null, 'for_WeakSet2', for_WeakSet_UglifyjsPlugin))
      // .then(log)
      // });
  } catch (err) {
    console.error(err);
  }
}

const Module = require('module');
const webpackPath = require.resolve('webpack/lib/webpack');
const TAPABLES = [
  // 'tapable',
  'webpack/lib/Compilation',
  'webpack/lib/Compiler',
  'webpack/lib/ContextModuleFactory',
  'webpack/lib/DllModuleFactory',
  'webpack/lib/MultiCompiler',
  'webpack/lib/MultiModuleFactory',
  'webpack/lib/NormalModuleFactory',
  'webpack/lib/Parser',
  'webpack/lib/ChunkTemplate',
  'webpack/lib/HotUpdateChunkTemplate',
  'webpack/lib/MainTemplate',
  'webpack/lib/ModuleTemplate',
].map(require.resolve);

const proxies = new WeakSet();

function formatArgs(args) {
  return args.map(formatArg).join(', ');
}

function formatArg(arg) {
  if (typeof arg === 'number') {
    return arg;
  }

  if (typeof arg === 'string') {
    return JSON.stringify(arg);
  }

  if (Array.isArray(arg)) {
    return '<array>';
  }

  if (typeof arg === 'function') {
    return '<function>';
  }

  if (typeof arg === 'object') {
    if (Object.getPrototypeOf(arg) !== null && !isPlainObject(arg)) {
      return `<${arg.constructor.name} instance>`;
    }
    return '<object>';
  }

  return arg;
}

const classMethodHandler = {
  construct: function(target, args) {
    log.construct(`new ${target.name}(${formatArgs(args)})`);
    const result = Reflect.construct(target, args);
    // log.invoke(Object.getOwnPropertyDescriptors(result));
    // log.invoke(result);
    // return result;

    for (let key in result) {
      // if (key.substr(0, 5) === 'apply' || key.substr(0, 6) === 'plugin') {
      if (key.substr(0, 6) === 'plugin') {
        result[key] = new Proxy(result[key], {
          apply(target, that, args) {
            log.invoke(`${target.name}(${formatArgs(args)})`);
            return Reflect.apply(target, that, args);
          }
        })
      }
    }
    return result;

    // return new Proxy(result, {
    //   apply(target, that, args) {
    //     log.invoke('apply', args);
    //     return Reflect.apply(target, that, args);
    //   },
    //   get(target, key, receiver) {
    //     log.invoke(`accessed property:`, key);
    //   }
    // })
  },
};

Module.prototype.require = new Proxy(Module.prototype.require, {
  apply(target, self, args) {
    const id = Module._resolveFilename(args[0], self);
    let result = Reflect.apply(target, self, args);

    if (webpackPath === id) {
      return new Proxy(result, {
        apply(target, that, args) {
          log.invoke('apply', args);
          return Reflect.apply(target, that, args);
        },
        get(target, key, receiver) {
          log.get(`accessed property:`, key);
        }
      })
    }

    if ((TAPABLES.includes(id) || /webpack\/lib\/.*Plugin.js$/.test(id))&& !proxies.has(result)) {
      result = new Proxy(result, classMethodHandler);
      proxies.add(result);
      // proxies.set(result, class NewClass extends result {
      //   constructor(...args) {
      //     return Proxy(new super.constructor(...args), new NewClass.handler());
      //   }

      //   static handler() {
      //     return {
      //       get(target, key, receiver) {
      //         log.invoke(`accessed property:`, key, receiver);
      //       }
      //     }
      //   }
      // });
      // return proxies.get(result);
      // log.invoke(result)
      // const proxy = new Proxy(result.prototype, {
      //   set(target, key, value, receiver) {
      //     log.invoke(`set property: ${key}`, value, receiver);
      //     // log.invoke(`set property: ${key}`);
      //     return Reflect.set(target, key, receiver);
      //   },
      //   get(target, key, receiver) {
      //     log.invoke(`accessed property:`, key, receiver);

      //     return Reflect.get(target, key, receiver);
      //   }
      // });
      // proxies.set(result, proxy);
      // return proxy;
    }

    return result;
  }
});

// function deepProxify(obj) {
//   if (Object.getPrototypeOf(obj) !== null) {
//     obj = new
//     return;
//   }
// }

const events = new Mao;
function createEvent(id, contents) {
  events.set(id. contents);
}

process.nextTick(() => {
  const webpack = require('webpack');
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
  const config = require('../config/webpack.config.profile');
  config.entry = path.resolve('./src/App4');
  config.plugins = [new UglifyJsPlugin()];

  const compiler = webpack(config);
  compiler.apply = new Proxy(compiler.apply, {
    apply(target, that, args) {
      createEvent
      log.invoke(`${that.constructor.name}.${target.name}(${formatArgs(args)})`);
      return Reflect.apply(target, that, args);
    }
  });
  // log.invoke(compiler);
  // log.invoke(Object.getOwnPropertyDescriptors(compiler));
  compiler.run(() => {});
});

