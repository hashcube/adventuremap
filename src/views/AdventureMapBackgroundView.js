import ui.View as View;
import ui.ViewPool as ViewPool;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;

import .tiles.TileView as TileView;
import .AdventureMapLayerView;

exports = Class(AdventureMapLayerView, function (supr) {
  var calls = 0;
  var calls_lf = 0;
  var pool;
  var h_padding = 0;
  var v_padding = 10;

  var h_slider_head = 12;
  var h_slider_tail = 0;
  var v_slider_head = 20;
  var v_slider_tail = 0;

  var v_head = 20 + v_padding*2;
  var v_tail = 0;
  var h_head = 12 + h_padding*2;
  var h_tail = 0;

  this.init = function (opts) {
    supr(this, 'init', [opts]);

    this._tiles = opts.tileSettings.tiles ?
      this._loadTiles(opts.tileSettings.tiles) : [];

    var margin = opts.editMode ? 8 : 0;
    var tileWidth = opts.tileSettings.tileWidth;
    var tileHeight = opts.tileSettings.tileHeight;
    this._map = opts.map;
    pool = new ViewPool({
      //ctor: TextView,
      ctor: TileView,
      initCount: v_head*h_head,
      initOpts: {
        tileSettings: opts.tileSettings,
        width: tileWidth - margin,
        height: tileHeight - margin
      }
    });
  };

  this.getPosition = function (direction) {
    return {
      v: [v_tail, v_head],
      h: [h_tail, h_head]
    };
  };

  this.setTile = function (x, y) {
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight

    var view = pool.obtainView({
      superview: this,
      x: x * tileWidth,
      y: y * tileHeight
    });
    view.update(x, y);
    return view;
  }

  this._loadTiles = function (tiles) {
    var i = tiles.length;
    while (i) { if (typeof tiles[--i] === 'string') {
        //console.log('loadtile', i);
        tiles[i] = new View({});
        //tiles[i] = new Image({url: tiles[i]});
      }
    }
    return tiles;
  };

  this.populateRow = function (count) {

    var width = this._gridSettings.width;
    var height = this._gridSettings.height;
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight
    var margin = this._editMode ? 8 : 0;
    var num = 1;
    var swap = false;
    var cell_size = tileWidth;

    calls += count;
    //console.log('------------------------------------');
    //console.log('calls', calls, '/', cell_size);
    if (calls < cell_size) {
      return;
    } else {
      num = Math.floor(calls/cell_size);
      calls = Math.floor(calls % cell_size);
      console.log('row: create', num);
    }

    if (h_slider_head + num > width) {
      h_slider_tail = width - (h_slider_head - h_slider_tail);
      h_slider_head = width;
    } else {
      h_slider_tail += num;
      h_slider_head += num;
    }

    // right end condition
    if (h_head + num > width) {
      num = width - h_head;
    }

    // left end condition
    if (h_slider_tail - h_padding > h_tail) {

      var end = h_head + num - 1;
      for (var y = v_tail; y < v_head; y++) {
        var line = this._views[y];

        //console.log('loop', h_head, '->', end);
        for (var x = h_head; x <= end; x++) {
          var rel = h_tail + (end - x);
            if(y===0) {
              console.log('row: creating', x, 'releasing', rel, 'tail', h_tail, 'head', h_head);
            }

            if (line[rel]) {
              pool.releaseView(line[rel]);
              line[rel] = null;
            }

            line[x] = this.setTile(x, y);
        }
        this._views[y] = line;
      }
      h_head += num;
      h_tail += num;
    }

    //console.log('tail', h_tail, 'head', h_head, 'num', num, 'slider', slider_tail, slider_head);
    //console.log('------------------------------------');
  };

  this.populateRowLeft = function (count) {
    var width = this._gridSettings.width;
    var height = this._gridSettings.height;
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight
    var margin = this._editMode ? 8 : 0;
    var num = 1;
    var swap = false;
    var cell_size = tileWidth;

    calls += count;
    //console.log('------------------------------------');
    //console.log('calls', calls, '/', cell_size);
    if (calls < cell_size) {
      return;
    } else {
      num = Math.floor(calls/cell_size);
      calls = Math.floor(calls % cell_size);
      console.log('row-left: create', num);
    }

    if (h_slider_tail - num < 0) {
      h_slider_head = (h_slider_head - h_slider_tail);
      h_slider_tail = 0;
    } else {
      h_slider_tail -= num;
      h_slider_head -= num;
    }

    // left end condition
    if (h_tail - num < 0) {
      num = h_tail;
    }

    //console.log('slider', slider_head, slider_tail, num);

    // right end condition
    if (h_slider_tail - h_padding < h_tail) {
      var end = h_tail - num;

      for (var y = v_tail; y < v_head; y++) {
        var line = this._views[y];

        //console.log('loop', tail - 1, '->', end);
        for (var x = h_tail - 1; x >= end; x--) {
          var rel = h_head - (h_tail - x);
            if(y===0) {
              console.log('row-left: creating', x, 'releasing', rel, 'tail', h_tail, 'head', h_head);
            }

            if (line[rel]) {
              pool.releaseView(line[rel]);
              line[rel] = null;
            }

            line[x] = this.setTile(x, y);
        }
        this._views[y] = line;
      }
      h_head -= num;
      h_tail -= num;
    }

    //console.log('tail', tail, 'head', head, 'num', num, 'slider', slider_tail, slider_head);
    //console.log('------------------------------------');
  };

  this.populateColumn = function (count) {
    var width = this._gridSettings.width;
    var height = this._gridSettings.height;
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight
    var margin = this._editMode ? 8 : 0;
    var num = 1;
    var swap = false;
    var cell_size = tileHeight;

    calls_lf += count;
    //console.log('------------------------------------');
    //console.log('calls_lf', calls_lf, '/', cell_size);
    if (calls_lf < cell_size) {
      return;
    } else {
      num = Math.floor(calls_lf/cell_size);
      calls_lf = Math.floor(calls_lf % cell_size);
      console.log('colum: create', num);
    }

    // right end
    if (v_slider_head + num > height) {
      v_slider_tail = height - (v_slider_head - v_slider_tail);
      v_slider_head = height;
    } else {
      v_slider_tail += num;
      v_slider_head += num;
    }
    // right end condition
    if (v_head + num > height) {
      num = height - v_head;
    }

    // left end condition
    if (v_slider_tail - v_padding > v_tail) {
      var end = v_head + num - 1;

      for (var y = v_head; y <= end; y++) {
        for (var x = h_tail; x < h_head; x++) {
          var rel = v_tail + (y - v_head);
            if(x===0) {
              console.log('column: creating', y, 'releasing', rel, [v_tail, v_head]);
            }

            //if (this._views[rel][x]) {
              pool.releaseView(this._views[rel][x]);
              this._views[rel][x] = null;
            //}


            if (!this._views[y]) {
              this._views[y] = [];
            }
            this._views[y][x] = this.setTile(x, y);
        }
      }
      v_head += num;
      v_tail += num;
    }

    //console.log('slider', [v_slider_tail, v_slider_head], [v_tail, v_head]);
    //console.log('------------------------------------');
  };

  this.populateColumnTop = function (count) {
    var width = this._gridSettings.width;
    var height = this._gridSettings.height;
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight
    var margin = this._editMode ? 8 : 0;
    var num = 1;
    var swap = false;
    var cell_size = tileHeight;

    calls_lf += count;
    //console.log('------------------------------------');
    //console.log('calls_lf', calls_lf, '/', cell_size);
    if (calls_lf < cell_size) {
      return;
    } else {
      num = Math.floor(calls_lf/cell_size);
      calls_lf = Math.floor(calls_lf % cell_size);
      console.log('column-top: create', num);
    }


    if (v_slider_tail - num < 0) {
      v_slider_head = (v_slider_head - v_slider_tail);
      v_slider_tail = 0;
    } else {
      v_slider_tail -= num;
      v_slider_head -= num;
    }
    // left end condition
    if (v_tail - num < 0) {
      num = v_tail;
    }
    //console.log('slider', v_slider_head, v_slider_tail, num);

    // right end condition
    if (v_slider_head + v_padding < v_head) {
      var end = v_tail - num;

      for (var y = v_tail - 1; y >= end; y--) {
        //console.log('loop', v_tail -1, '->', end);
        for (var x = h_tail; x < h_head; x++) {
          var rel = v_head - (v_tail - y);
            if(x===0) {
              console.log('column-top: creating', y, 'releasing', rel, [v_tail, v_head]);
            }

            //if (this._views[rel][x]) {
              pool.releaseView(this._views[rel][x]);
              this._views[rel][x] = null;
            //}

            if (!this._views[y]) {
              this._views[y] = [];
            }
            this._views[y][x] = this.setTile(x, y);
        }
      }
      v_head -= num;
      v_tail -= num;
    }

    //console.log('slider', [v_slider_tail, v_slider_head], [v_tail, v_head]);
    //console.log('------------------------------------');
  };


  this.populateView = function (data) {
    var grid = data.grid;
    var width = this._gridSettings.width;
    var height = this._gridSettings.height;
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight
    var margin = this._editMode ? 8 : 0;

    for (var y = 0; y < v_head; y++) {
      var line = this._views[y] || [];
      for (var x = 0; x < h_head; x++) {
        if(!line[x]) {
          console.log('populate', y, x);
          var view = this.setTile(x, y);
          line.push(view);
        }
      }

      this._views.push(line);
    }

    this._grid = grid;
    this._needsPopulate = false;
  };

  this.getMap = function () {
    return this._map;
  };

  this.refreshTile = function (tileX, tileY) {
    console.log('refreshTile', tileX, tileY);
    //this._views[tileY][tileX].setImage(this._tiles[this._map[tileY][tileX]]);
  };
});
