/* jshint node:true */
"use strict";

var map_config = require('./map_config.json'),
  fs = require('fs'),
  _ = require('underscore'),
  width = map_config.width,
  height = map_config.height,
  grid = [],
  tile_config = [],
  jsio = require('jsio'),
  writable = fs.createWriteStream('./maps/final_map.json'),
  i = 0,
  j = 0,
  row_data = [],
  current_ms = 1,
  bridge_count = 0,
  bridge_length = map_config.bridge.length,
  initial_tile,
  ms_tile,
  lower_range,
  current_tile = height * width;

jsio('import .maps.map_empty as map_data');

if (!map_data) {
  process.exit(1)
}

tile_config.push({
  range: [0, 4],
  folder: 'comingsoon'
})

_.each(map_config.maps, function (data, num) {
  var map_name = 'map' + (num + 1),
    map_loc = './maps/' + map_name,
    file_data = require(map_loc),
    loop_data = file_data.grid,
    i = 0,
    ms_count = 0,
    milestones = {},
    map_writable = fs.createWriteStream(map_loc + '.json');

  map_writable.write(JSON.stringify(file_data, null, 2));
  map_writable.end();

  do {
    current_tile = initial_tile = current_tile - (data.length * width);

    _.each(loop_data, function (row_data) {
      _.each(row_data, function (cell_data) {
        if (!_.isNumber(cell_data)) {
          ms_count++;
        }
      });
    });

    _.each(loop_data, function (row_data) {
      _.each(row_data, function (cell_data) {
        if (!_.isNumber(cell_data)) {
          milestones[ms_count] = cell_data;
          ms_count--;
        }
      });
    });

    _.each(milestones, function (ms_data, ms) {
      var ms_obj = {
          node: '1',
          'friends': {
            'position': 'bottom'
          },
          'tags':{
            'milestone': true
          }
        };

      ms_tile = current_tile + ms_data.map;
      ms_obj.map = ms_tile;
      ms_obj.id = current_ms;
      if (ms_data.x) {
        ms_obj.x = ms_data.x;
      }
      if (ms_data.y) {
        ms_obj.y = ms_data.y;
      }

      map_data.grid[Math.floor(ms_tile / width)][ms_tile % width] = ms_obj;
      current_ms++;
    });
    i++;

    current_tile = initial_tile;
  } while (i < data.repeat)

  // For map tile config
  lower_range = Math.floor(initial_tile / width);
  tile_config.splice(1, 0, {
    range: [lower_range, lower_range + data.length * data.repeat - 1],
    folder: map_name,
    length: data.length
  });

  // For bridge tile config
  lower_range--;
  current_tile = current_tile - (bridge_length * width);
  bridge_count++;
  tile_config.splice(1, 0, {
    range: [lower_range - bridge_length + 1, lower_range],
    folder: 'bridge' + bridge_count,
    length: bridge_length
  });
});

// Remove last bridge
tile_config.splice(1, 1);
console.log(tile_config);
writable.write('exports = ' + JSON.stringify(map_data, null, 2));
writable.end();
