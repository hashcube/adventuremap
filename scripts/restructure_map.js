var _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  jsio = require('jsio'),
  final_map = path.join(__dirname, 'maps/final_map_restr.js'),
  writable = fs.createWriteStream(final_map),
  new_grid = {}, new_obj,
  restructure_map = function () {
    jsio.path.add('../');
    jsio('import scripts.maps.final_map as original_map');
    _.each(original_map.grid, function (grids) {
      _.each(grids, function (item) {
        if (_.isObject(item)) {
          new_obj = _.omit(item, 'map');
          new_grid[item.map] = new_obj;
        }
      });
    });
    console.log(JSON.stringify(new_grid) + " \n");
    original_map.grid = new_grid;

    writable.write('exports = ' + JSON.stringify(original_map, null, 2) + ';');
    writable.end();
  };
restructure_map();
