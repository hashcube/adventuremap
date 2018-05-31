/* jshint node:true */
"use strict";

var _ = require('lodash'), 
  path = require('path'),
  fs = require('fs'),
  map_config_path = process.argv[4] ? process.argv[4] :
  path.join(__dirname, 'map_config.json'),
  map_config = require(map_config_path),
  map_data = {},
  map_id = process.argv[2],
  map_length = map_config.maps[0].length,
  map_repeat = map_config.maps[0].repeat,
  bridge_length = map_config.bridge.length,
  last_chapter_height = map_config.height,
  first_chapter_height = map_length * map_repeat + bridge_length,
  total_chapters = map_config.length,
  data = fs.readFileSync('maps/final_map.js', 'utf8'),
  chapters = [],
  id = 1,
  grid;

for (var i = map_config.height; i >= first_chapter_height; i -= first_chapter_height) {
  chapters.push(i - bridge_length);
}

data = JSON.parse(data.split('exports = ')[1].split(';')[0]);

grid = _.reverse(data.grid);

_.each(grid, function (row, idx) {
  if (chapters.indexOf(idx) > -1) {
    var tile = row[0];

    row[0] = {
      chapter: true,
      map: tile,
      id: id
    };

    id++;
  }
});

grid = _.reverse(grid);
data.grid = grid;
fs.writeFileSync('./tile.js', 'exports = ' + JSON.stringify(data, null, 2) + ';');
console.log("Chapters added successfully");
