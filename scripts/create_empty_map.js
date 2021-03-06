/* jshint node:true */
"use strict";

var path = require('path'),
  map_config_path = process.argv[4] ? process.argv[4] :
    path.join(__dirname, 'map_config.json'),
  map_config = require(map_config_path),
  fs = require('fs'),
  _ = require('underscore'),
  map_data = {},
  map_id = process.argv[2],
  width = map_config.width,
  tileWidth = map_config.tileWidth,
  tileHeight = map_config.tileHeight,
  grid = [],
  map_empty_path = process.argv[3] ? process.argv[3] :
    path.join(__dirname, 'maps/map_empty.js'),
  writable = fs.createWriteStream(map_empty_path),
  row_data = [],
  height = 0,
  writ_config;

if(!map_id) {
  // adding heights for map
  _.each(map_config.maps, function (data) {
    height += data.length * data.repeat;
  });
  height += map_config.comingsoon.length;
  height += map_config.bridge.length * (map_config.maps.length - 1);

  map_config.height = height;
  writ_config = fs.createWriteStream(map_config_path),
  writ_config.write(JSON.stringify(map_config, null, 2))
  writ_config.end();
} else {
  height = map_config.maps[map_id - 1].length + 1;
}

_.times(height, function (i) {
  row_data = [];
  _.times(width, function (j) {
        row_data.push(i * width + j);
  });
  grid.push(row_data);
});

map_data = {
  width: width,
  height: height,
  tileWidth: tileWidth,
  tileHeight: tileHeight,
  grid: grid
};
writable.write('exports = ' + JSON.stringify(map_data, null, 2) + ';');
writable.end();
