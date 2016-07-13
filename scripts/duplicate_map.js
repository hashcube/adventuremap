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
  map_config_path = process.argv[4] ? process.argv[4] :
    path.join(__dirname, 'map_config.json'),
  writable = fs.createWriteStream(final_map),
  i = 0,
  j = 0,
  row_data = [],
  current_ms = 1,
  bridge_count = 0,
  create_map_group = function (i, loop_data, length) {
    current_tile = current_tile - (length * width);

    for (var j = loop_data.length; j-- > 0;) {
      _.each(loop_data[j], function (tile) {
        return check_object(tile);
      });
    }
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
  },
  map_data_path = path.join(__dirname, 'maps/map_empty');

// Setup empty map
exec('node ' + empty_map_path).stdout.pipe(process.stdout);

map_config = require(map_config_path);
width = map_config.width,
height = map_config.height,
bridge_length = map_config.bridge.length;
current_tile = height * width;

jsio.path.add('../');
jsio('import adventuremap.scripts.maps.map_empty as map_data');

tile_config.push({
  range: [0, 4],
  folder: 'comingsoon'
})

_.each(map_config.maps, function (data, num) {
  var map_name = 'map' + (num + 1),
    map_loc = path.join(process.cwd(), process.argv[2]) + '/' + map_name,
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
writable.write('exports = ' + JSON.stringify(map_data, null, 2) + ';');
writable.end();
