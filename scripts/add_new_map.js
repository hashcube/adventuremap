var _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  jsio = require('jsio'),
  new_maps_loc = 'new_maps/',
  bridge_height = 3,
  coming_soon_height = 5,
  width = 10,
  length = 20,
  len = 0,
  repeat = process.argv[3] || 1,
  chapter = process.argv[4] && parseInt(process.argv[4]) === 1 ? true : false,
  max_ms = parseInt(process.argv[2]),
  single_map_len = length * repeat,
  chapter_count = max_ms / length,
  final_map = path.join(__dirname, 'maps/final_map.js'),
  new_config = path.join(__dirname, 'maps/final_config.json'),
  writable = fs.createWriteStream(final_map),
  writable_config = fs.createWriteStream(new_config),
  new_maps = fs.readdirSync(new_maps_loc),
  new_height = (new_maps.length * single_map_len) + (new_maps.length * bridge_height),
  old_config = fs.readFileSync(path.join(__dirname, 'maps/tile_config.json'), 'utf8'),
  new_map_config = [],
  actual_height, map_no, new_item, map_data
  get_object = function (tile, pos) {
    var ms_obj = {
      node: '1',
      'friends': {
        'position': 'bottom'
      },
      'tags':{
        'milestone': true
      }
    };
    ms_obj.map = pos;
    ms_obj.id = max_ms;
    max_ms--;
    if (tile.x || tile.x === 0) {
      ms_obj.x = tile.x;
    }
    if (tile.y || tile.y === 0) {
      ms_obj.y = tile.y;
    }
    return ms_obj;
  },
  create_map = function () {
    var final_map = [],
      i = 0;

    if (!_.isNumber(max_ms) && max_ms > 0) {
      console.log("Error: Please provide total no of milestones!!");
      return;
    }

    console.log("Starting with max ms: ", max_ms, "\nRepeat: ", repeat, "\nchapter: ", chapter);

    old_config = JSON.parse(old_config.replace(/'/g,'"')
      .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": '));

    jsio.path.add('../');
    jsio('import scripts.maps.original_map as original_map');

    actual_height = new_height + original_map.height;

    _.times(coming_soon_height, function () {
      new_item = [];
      _.times(width, function () {
        new_item.push(++i);
      });
      final_map.push(new_item);
    });

    new_map_config.push({
      range: [len, len + coming_soon_height - 1],
      folder: 'comingsoon'
    });

    len = len + coming_soon_height - 1;

    _.each(new_maps, function (map) {
      map_no = parseInt(map.replace( /[^\d.]/g, '' ));
      map_data = require(path.join(process.cwd(), new_maps_loc + map));
      _.times(repeat, function () {
        _.each(map_data.grid, function (grid_item) {
          new_item = [];
          _.each(grid_item, function (item) {
            i++;
            if (_.isObject(item)) {
              new_item.push(get_object(item, i));
            } else {
              new_item.push(i);
            }
          });
          final_map.push(new_item);
        });        
      });

      new_map_config.push({
        range: [len + 1, len + single_map_len],
        folder: 'map' + map_no,
        length: length
      });

      len = len + single_map_len;

      new_map_config.push({
        range: [len + 1, len + bridge_height],
        folder: 'bridge' + map_no
      });

      len = len + bridge_height;

      _.times(bridge_height, function () {
        new_item = [];
        _.times(width, function () {
          new_item.push(++i)
        });
      });

      final_map.push(new_item);

      if (chapter) {
        var chapter_obj = {
          chapter: true,
          id: --chapter_count,
          map: final_map[final_map.length -1][0]
        };

        final_map[final_map.length -1][0] = chapter_obj;
      }
    });

    _.each(old_config, function (conf) {
      if (conf.folder.search(/bridge/) !== -1) {
        new_map_config.push({
          range: [len + 1, len + bridge_height],
          folder: conf.folder
        });

        len = len + bridge_height;
      } else if (conf.folder.search(/map/) !== -1) {
        new_map_config.push({
          range: [len + 1, len + single_map_len],
          folder: conf.folder,
          length: length
        });

        len = len + single_map_len;
      }
    });

    original_map.grid.splice(0, bridge_height);

    _.each(original_map.grid, function (grids) {
      new_item = [];
      _.each(grids, function (item) {
        i++;
        if (_.isObject(item)) {
          if (item.chapter) {
            item.id = --chapter_count,
            item.map = i;
          }
          new_item.push(item);
        } else {
          new_item.push(i);
        }
      });

      final_map.push(new_item);
    });

    var map_obj = {};

    map_obj.height = actual_height;
    map_obj.grid = final_map;
    map_obj.width = original_map.width;
    map_obj.tileWidth = original_map.tileWidth;
    map_obj.tileHeight = original_map.tileHeight;

    writable.write('exports = ' + JSON.stringify(map_obj, null, 2) + ';');
    writable.end();


    writable_config.write(JSON.stringify(new_map_config, null, 2));

    console.log("\n**Map Added successfully**\n\nCopy final_map.js to",
      "your map file\nCopy final_config.json to your tile config\n",
      "Update grid file with new height");
  };

create_map();
