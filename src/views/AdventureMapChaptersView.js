import ui.ViewPool as ViewPool;

import .tiles.ChapterView as ChapterView;
import .AdventureMapLayerView;

exports = Class(AdventureMapLayerView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		var chapterWidth = opts.chapterSettings.chapterWidth;
		var chapterHeight = opts.chapterSettings.chapterHeight;
		var x_pos = (this._adventureMapView._totalWidth -
		this._chapterSettings.chapterWidth) / 2

		this._pool = new ViewPool({
			ctor: ChapterView,
			initCount: opts.chapterSettings.poolCount || 50,
			initOpts: {
				x: x_pos,
				width: chapterWidth,
				height: chapterHeight,
				chapterSettings: opts.chapterSettings,
				adventureMapView: opts.adventureMapView
			}
		});

		this.canHandleEvents(false);
	};

	this.populateView = function (data) {
		var grid = data.grid;
		var width = this._gridSettings.width;
		var height = this._gridSettings.height;
		var tileHeight = this._tileSettings.tileHeight;
		var pos = data.pos;

		for (var y = pos.v[0]; y < pos.v[1]; y++) {
			var line = this._views[y] || [];
			for (var x = pos.h[0]; x < pos.h[1]; x++) {
				var view = null;
				var tile = grid[y][x];
				if (this._editMode || tile.chapter) {
					view = this._pool.obtainView({
						superview: this,
						y: y * tileHeight
					});

					view.update(grid, x, y);
				}
				line[x] = view;
			}

			this._views[y] = line;

			this._grid = grid;
			this._needsPopulate = false;
		}
	};

	this.create = function (x, y, grid) {
		var tileHeight = this._tileSettings.tileHeight;

		var tile = grid[y][x];

		if (!tile.chapter) {
			return;
		}

		if (!this._views[y]) {
			this._views[y] = [];
		}

		var view = this._pool.obtainView({
			superview: this,
			y: y * tileHeight
		});
		view.update(grid, x, y);
		this._views[y][x] = view;
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

				if (!view && tile.chapter) {
					this.create(x, y, grid);
				} else if (view && view.update) {
					view.update(grid, x, y);
				}
			}
		}
	};

	this.release = function (x, y) {
		if (this._views[y] && this._views[y][x]) {
			this._views[y][x].onReleaseChapter(this._grid, x, y);
			this._pool.releaseView(this._views[y][x]);
			this._views[y][x] = null;
		}
	};
});
