/* jshint node:true */
"use strict";

var map_config = require('./map_config.json'),
  fs = require('fs'),
  map_data = {},
  width = map_config.width,
  height = map_config.height,
  tileWidth = map_config.tileWidth,
  tileHeight = map_config.tileHeight,
  grid = [],
  writable = fs.createWriteStream('./maps/map_empty.js'),
  i = 0,
  j = 0,
  row_data = [];

do {
  row_data = [];
  j = 0;
  do {
    row_data.push(i * 10 + j);
    j++;
  } while (j < width);

  grid.push(row_data);
  i++;
} while (i <= height);

map_data = {
  width: width,
  height: height,
  tileWidth: tileWidth,
  tileHeight: tileHeight,
  grid: grid
};
writable.write('exports = ' + JSON.stringify(map_data, null, 2) + ';');
writable.end();
