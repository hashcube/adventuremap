var path = require('path'),
  IMAGES_DIRECTORY = path.join(__dirname, '..', 'images');

exports.getResourceDirectories = function (api, app, config, cb) {
  var dirs = [];

  if (config.debug) {
    dirs.push({
      src: IMAGES_DIRECTORY,
      target: 'images/'
    });
  }

  return dirs;
};
