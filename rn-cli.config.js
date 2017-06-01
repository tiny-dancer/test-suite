const path = require('path');
const escape = require('escape-string-regexp');
const blacklist = require('react-native/packager/blacklist');

module.exports = {
  getBlacklistRE() {
    return blacklist([
      new RegExp(
        `^${escape(path.resolve(__dirname, 'node_modules', 'expo', 'node_modules'))}\\/.*$` // eslint-disable-line prettier/prettier
      ),
    ]);
  },
};
