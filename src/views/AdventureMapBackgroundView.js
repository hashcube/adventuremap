import ui.ViewPool as ViewPool;

import .tiles.TileView as TileView;
import .AdventureMapLayerView;

exports = Class(AdventureMapLayerView, function (supr) {
  var pool;

  this.init = function (opts) {
    supr(this, 'init', [opts]);

    var margin = opts.editMode ? 8 : 0;
    var tileWidth = opts.tileSettings.tileWidth;
    var tileHeight = opts.tileSettings.tileHeight;
    this._map = opts.map;
    pool = new ViewPool({
      ctor: TileView,
      initCount: opts.poolSize,
      initOpts: {
        tileSettings: opts.tileSettings,
        width: tileWidth - margin,
        height: tileHeight - margin
      }
    });
  };

  this.setTile = function (x, y) {
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight;

    var view = pool.obtainView({
      superview: this,
      x: x * tileWidth,
      y: y * tileHeight
    });
    view.update(null, x, y);
    return view;
  };

  this.release = function (x, y) {
    if(this._views[y] && this._views[y][x]) {
      pool.releaseView(this._views[y][x]);
      this._views[y][x] = null;
    }
  };

  this.create = function (x, y) {
    if (!this._views[y]) {
      this._views[y] = [];
    }
    this._views[y][x] = this.setTile(x, y);
  };

  this.populateView = function (data) {
    var grid = data.grid;
    var width = this._gridSettings.width;
    var height = this._gridSettings.height;
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight;
    var margin = this._editMode ? 8 : 0;
    var pos = data.pos;

    for (var y = pos.v[0]; y < pos.v[1]; y++) {
      var line = this._views[y] || [];
      for (var x = pos.h[0]; x < pos.h[1]; x++) {
        if(!line[x]) {
          var view = this.setTile(x, y);
          line[x] = view;
        }
      }

      this._views[y] = line;
    }

    this._grid = grid;
    this._needsPopulate = false;
  };

  this.getMap = function () {
    return this._map;
  };
});
