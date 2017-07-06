'use strict';

const ErrorStackParser = require('error-stack-parser');

function formatArg(arg) {
  if (typeof arg === 'undefined' || arg === null) {
    return arg;
  }
  if (typeof arg === 'string') {
    return '\'' + arg.substr(0, Math.min(30, arg.length)) + '\'';
  }
  if (Array.isArray(arg)) {
    return arg.slice(0, Math.min(5, arg.length))
  }
  if (typeof arg === 'object') {
    return `<${arg.name || 'object'}>`;
  }
  if (typeof arg === 'function') {
    arg = `${arg.name} <function>`;
  }
  return arg;
}

function formatArgs(self, key, args) {
  return `${self.constructor.name}.${key}(${
    args.map(formatArg).join(', ')
  })`;
}

function instrument(Class) {
  for (let key in Class.prototype) {
    if (typeof Class.prototype[key] !== 'function') {
      continue;
    }
    // if (key.substr(0, 5) === 'apply' || key.substr(0, 6) === 'plugin') {
    // if (key.substr(0, 6) === 'plugin') {
      const fn = Class.prototype[key];
      Class.prototype[key] = function (...args) {
        const parsed = ErrorStackParser.parse(new Error(null))
          .reduce((obj, frame) => {
            if (frame.fileName !== __filename && typeof obj.functionName === 'undefined') {
              Object.assign(obj, frame, {
                fileName: frame.fileName
                  .replace(/(.*)\/(node_modules|repos)\/(.*)/, '$3'),
                source: frame.source.replace(/(.*)\/(node_modules|repos)\/(.*)/, '$3'),
              });
            }

            return obj;
          }, {})
        // Error.captureStackTrace(ctx);
        console.log(key, parsed);
        // console.log(key, ctx.stack);
        // console.log(formatArgs(this, key, args));
        fn.apply(this, args);
      };
    // } else if (key.substr(0, 6) === 'plugin') {

    // }
  }

}

const isObject = obj => obj && typeof obj === 'object';
const hasKey = (obj, key) => key in obj;

const Undefined = new Proxy({}, {
  get: function(target, name) {
    return Undefined;
  }
});
const either = (val,fallback) => (val === Undefined? fallback : val);

function safe(obj) {
  return new Proxy(obj, {
    get: function(target, name, receiver) {
      if (name in target.__proto__) { // assume methods live on the prototype
        return function(...args) {
          console.log(name, args);
           var methodName = name;
           // we now have access to both methodName and arguments
        };
      } else { // assume instance vars like on the target
          return Reflect.get(target, name, receiver);
      }
    }
  });
}

// var p = new Proxy(account, {
//   get: function(target, name, receiver) {
//     if (name in target.__proto__) { // assume methods live on the prototype
//       return function(...args) {
//          var methodName = name;
//          // we now have access to both methodName and arguments
//       };
//     } else { // assume instance vars like on the target
//         return Reflect.get(target, name, receiver);
//     }
// };


module.exports = () => new Promise((resolve, reject) => {
  const Module = require('module');

  Module.prototype.require = new Proxy(Module.prototype.require, {
    apply(target, self, args) {

      let name = args[0];

      if (/MyModule/g.test(name)) {
        /*do stuff to MY module*/
        name = "resolveAnotherName"
      }

      return Reflect.apply(target, self, args);
    }
  });

  for (let key in require.cache) {
    delete require.cache[key];
  }

  const compiler = safe(new (require('webpack/lib/Compiler'))());
  // safe(require('tapable'));
  // safe(require('webpack/lib/Compilation'));
  // safe(require('webpack/lib/Compiler'));
  // safe(require('webpack/lib/ContextModuleFactory'));
  // safe(require('webpack/lib/DllModuleFactory'));
  // safe(require('webpack/lib/MultiCompiler'));
  // safe(require('webpack/lib/MultiModuleFactory'));
  // safe(require('webpack/lib/NormalModuleFactory'));
  // safe(require('webpack/lib/Parser'));
  // safe(require('webpack/lib/Template'));


  resolve(require('webpack/lib/webpack'))
});
