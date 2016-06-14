/* jshint node:true */
"use strict";

var map_config = require('./map_config.json'),
  fs = require('fs'),
  _ = require('underscore'),
  width = map_config.width,
  height = map_config.height,
  grid = [],
  jsio = require('jsio'),
  writable = fs.createWriteStream('./maps/final_map.json'),
  i = 0,
  j = 0,
  row_data = [],
  current_ms = 1,
  initial_tile,
  current_tile = height * width;

jsio('import .maps.map_empty as map_data');

if (!map_data) {
  process.exit(1)
}

_.each(map_config.maps, function (data, map_name) {
  var loop_data = require('./maps/' + map_name).grid,
    i = 0,
    ms_count = 0,
    milestones = {};

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
        },
        ms_tile;


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

  current_tile = current_tile - (map_config.bridge.length * width);
});

writable.write('exports = ' + JSON.stringify(map_data, null, 2));
writable.end();
