require("babel-register")({
  presets: [require('babel-preset-es2015-node6/object-rest'), require('babel-preset-stage-1')],
  babelrc: false,
  plugins: [
    require('babel-plugin-transform-decorators-legacy').default,
    require('babel-plugin-transform-flow-strip-types'),
  ],
});

var Run = require('./Run');
var Log = { collapsed: function (msg) { console.log('--- ' + msg); } };
var opts = require('minimist')(process.argv.slice(2));
Run.ios(Log, opts);
