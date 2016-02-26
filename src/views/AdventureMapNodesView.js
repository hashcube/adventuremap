import ui.View as View;
import ui.ViewPool as ViewPool;
import ui.resource.Image as Image;

import .tiles.NodeView as NodeView;
import .AdventureMapLayerView;

exports = Class(AdventureMapLayerView, function (supr) {
  this.init = function (opts) {
    supr(this, 'init', [opts]);

    var tileWidth = opts.tileSettings.tileWidth;
    var tileHeight = opts.tileSettings.tileHeight;

    this._pool = new ViewPool({
      ctor: NodeView,
      initCount: opts.nodeSettings.poolCount || 50, // default value
      initOpts: {
        width: tileWidth,
        height: tileHeight,
        adventureMap: opts.adventureMap,
        tileSettings: opts.tileSettings,
        nodeSettings: opts.nodeSettings,
        adventureMapView: opts.adventureMapView
      }
    });
  };

  this.populateView = function (data) {
    var grid = data.grid;
    var width = this._gridSettings.width;
    var height = this._gridSettings.height;
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight;
    var pos = data.pos;

    for (var y = pos.v[0]; y < pos.v[1]; y++) {
      var line = this._views[y] || [];
      for (var x = pos.h[0]; x < pos.h[1]; x++) {
        var view = null;
        var tile = grid[y][x];
        if (this._editMode || tile.node) {
          view = this._pool.obtainView({
            superview: this,
            x: x * tileWidth,
            y: y * tileHeight
          });

          view.update(grid, x, y);
        }
        line[x] = view;
      }

      this._views[y] = line;
    }

    this._grid = grid;
    this._needsPopulate = false;
  };

  this.release = function (x, y) {
    if (this._views[y] && this._views[y][x]) {
      this._views[y][x].onRelease();
      this._pool.releaseView(this._views[y][x]);
      this._views[y][x] = null;
    }
  };

  this.create = function (x, y, grid) {
    var tileWidth = this._tileSettings.tileWidth;
    var tileHeight = this._tileSettings.tileHeight;

    var tile = grid[y][x];

    if (!tile.node) {
      return;
    }

    if (!this._views[y]) {
      this._views[y] = [];
    }
    var view = this._pool.obtainView({
      superview: this,
      x: x * tileWidth,
      y: y * tileHeight,
    });
    view.update(grid, x, y);
    this._views[y][x] = view;
  };

  this.refreshNode = function (x, y) {
    var views = this._views,
      row = this._views[y];

    if (row && row[x]) {
      this._views[y][x].refreshLoc();
    }
  };

  this.refreshAll = function () {
    var views = this._views,
      grid = this._grid,
      width = this._gridSettings.width,
      height = this._gridSettings.height,
      view, tile, x, y;

    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        view = views[y] && views[y][x];
        tile = grid[y][x];

        if (!view && tile.node) {
          this.create(x, y, grid);
        } else if (view && view.update) {
          view.update(grid, x, y);
        }
      }
    }
  };
});
