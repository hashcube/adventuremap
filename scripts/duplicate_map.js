/* jshint node:true */
"use strict";

var map_config = require('./map_config.json'),
  fs = require('fs'),
  _ = require('underscore'),
  width = map_config.width,
  height = map_config.height,
  grid = [],
  map_data = require('./maps/map_empty.json'),
  writable = fs.createWriteStream('./maps/final_map.json'),
  i = 0,
  j = 0,
  row_data = [],
  current_ms = 1,
  initial_tile,
  current_tile = height * 10;

if (!map_data) {
  process.exit(1)
}

_.each(map_config.maps, function (data, map_name) {
  var loop_data = require('./maps/' + map_name),
    i = 0;

  do {
    current_tile = initial_tile = current_tile - (data.length * 10);
    _.each(loop_data, function (ms_data, ms) {
      var ms_count = _.keys(ms_data).length,
        ms_obj = {
          node: '1',
          'friends': {
            'position': 'bottom'
          },
          'tags':{
            'milestone': true
          }
        },
        ms_tile;


      ms_tile = current_tile + ms_data.map;
      ms_obj.map = ms_tile;
      if (ms_data.x) {
        ms_obj.x = ms_data.x;
      }
      if (ms_data.y) {
        ms_obj.y = ms_data.y;
      }

      map_data.grid[Math.floor(ms_tile / 10)][ms_tile % 10] = ms_obj;
      current_ms++;
    });
    i++;

    current_tile = initial_tile;
  } while (i < data.repeat)

  current_tile = current_tile - (map_config.bridge.length * 10);
});

writable.write(JSON.stringify(map_data, null, 2));
writable.end();

