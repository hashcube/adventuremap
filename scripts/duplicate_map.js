/* jshint node:true */
"use strict";

var ms_tile, lower_range, width, height,
  bridge_length, current_tile, map_config,
  exec = require('child_process').exec,
  path = require('path'),
  fs = require('fs'),
  _ = require('underscore'),
  grid = [],
  tile_config = [],
  jsio = require('jsio'),
  final_map = process.argv[3] ? process.argv[3] :
    path.join(__dirname, 'maps/final_map.js'),
  empty_map_path = path.join(__dirname, 'create_empty_map.js'),
  map_config_path = process.argv[4] ? path.join(process.cwd(), process.argv[4]) :
    path.join(__dirname, 'map_config.json'),
  tile_writable = fs.createWriteStream(path.join(process.cwd(), process.argv[2]) + '/tile_config.json'),
  writable = fs.createWriteStream(final_map),
  i = 0,
  j = 0,
  row_data = [],
  current_ms = 1,
  bridge_count = 0,
  create_map_group = function (loop_data, length) {
    var tiles = [],
      ms_tile;

    current_tile = current_tile - (length * width);

    for (var j = loop_data.length; j-- > 0;) {
      tiles = [];

      _.each(loop_data[j], function (tile) {
        if (_.isObject(tile)) {
          tiles.push(tile);
        } else {
          ms_tile = tile + current_tile;
          map_data.grid[Math.floor(ms_tile / width)][ms_tile % width] = ms_tile;
        }
      });

      _.sortBy(tiles, 'y');
      tiles.reverse();

      _.each(tiles, function (tile) {
        create_object(tile);
      });
    }
  },
  create_orig_map = function (repeat, length) {
    var tile_value = 0,
      row_difference = map_data.height - orig_map_data.height,
      ms_tile, row, col;

    for (var j = repeat; j-- > 0;) {
      tile_value = 0;
      current_tile = current_tile - (length * width);
      for (var k = length; k-- > 0;) {
        for (var l = -1; l++ < width - 1;) {
            ms_tile = tile_value + current_tile;

            row = Math.floor(ms_tile / width);
            col = ms_tile % width;
            map_data.grid[row][col] = orig_map_data.grid[row - row_difference][col];
            tile_value++;
        };
      }
    }
  },
  create_object = function (tile) {
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
      if (tile.x || tile.x === 0) {
        ms_obj.x = tile.x;
      }
      if (tile.y || tile.y === 0) {
        ms_obj.y = tile.y;
      }
      return ms_obj;
    }
  },
  map_data_path = 'maps/map_empty';

// Setup empty map
exec('node ' + empty_map_path).stdout.pipe(process.stdout);

map_config = require(map_config_path);
width = map_config.width,
height = map_config.height,
bridge_length = map_config.bridge.length;
current_tile = height * width;

jsio.path.add('../');
jsio('import scripts.maps.map_empty as map_data');
jsio('import scripts.maps.original_map as orig_map_data');

tile_config.push({
  range: [0, 4],
  folder: 'comingsoon'
})

_.each(map_config.maps, function (data, num) {
  var map_name = 'map' + (num + 1),
    map_loc = path.join(process.cwd(), process.argv[2]) + '/' + map_name,
    milestones = {},
    file_data, loop_data;

  try {
    file_data = require(map_loc);
    loop_data = file_data.grid;

    _.times(data.repeat, function () {
      create_map_group(loop_data, data.length);
    });
  }
  catch (e) {
    console.log(map_name + ' was not found, using original elements')
    create_orig_map(data.repeat, data.length);
  }

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
console.log(tile_config);
tile_writable.write(JSON.stringify(tile_config, null, 2));
tile_writable.end();
writable.write('exports = ' + JSON.stringify(map_data, null, 2) + ';');
writable.end();
