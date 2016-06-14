/* jshint node:true */
"use strict";

var ms_tile, lower_range, width, height,
  bridge_length, current_tile, map_config,
  exec = require('child_process').exec,
  fs = require('fs'),
  _ = require('underscore'),
  grid = [],
  tile_config = [],
  jsio = require('jsio'),
  writable = fs.createWriteStream('./maps/final_map.json'),
  i = 0,
  j = 0,
  row_data = [],
  current_ms = 1,
  bridge_count = 0,
  create_map_group = function (i, loop_data, length) {
    current_tile = current_tile - (length * width);

    _.each(loop_data, function (row) {
      return _.each(row, function (tile) {
        return check_object(tile);
      });
    });
  },
  check_object = function (tile) {
    var ms_obj = {
      node: '1',
      'friends': {
        'position': 'bottom'
      },
      'tags':{
        'milestone': true
      }
    };

    if (_.isObject(tile)) {
      ms_tile = current_tile + tile.map;
      ms_obj.map = ms_tile;
      ms_obj.id = current_ms;
      map_data.grid[Math.floor(ms_tile / width)][ms_tile % width] = ms_obj;
      current_ms++;
      if (tile.x) {
        ms_obj.x = tile.x;
      }
      if (tile.y) {
        ms_obj.y = tile.y;
      }

      return ms_obj;
    } else {
      return tile + current_tile;
    }
  };

// Setup empty map
exec('node create_empty_map.js');

map_config = require('./map_config.json');
width = map_config.width,
height = map_config.height,
bridge_length = map_config.bridge.length;
current_tile = height * width;

jsio('import .maps.map_empty as map_data');

tile_config.push({
  range: [0, 4],
  folder: 'comingsoon'
})

_.each(map_config.maps, function (data, num) {
  var map_name = 'map' + (num + 1),
    map_loc = './maps/' + map_name,
    file_data = require(map_loc),
    loop_data = file_data.grid,
    milestones = {},
    map_writable = fs.createWriteStream(map_loc + '.json');

  map_writable.write(JSON.stringify(file_data, null, 2));
  map_writable.end();

  _.times(data.repeat, function (i) {
    create_map_group(i, loop_data, data.length);
  });

  // For map tile config
  lower_range = Math.floor(current_tile / width);
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
writable.write('exports = ' + JSON.stringify(map_data, null, 2));
writable.end();
