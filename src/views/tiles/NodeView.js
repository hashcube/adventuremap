import math.geom.Vec2D as Vec2D;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import ui.ScoreView as ScoreView;
import animate;

exports = Class(ImageView, function (supr) {
	var invert = function(direction) {
		var ret,
			pos = {
				left: 'right',
				right: 'left'
			};

		if (direction !== '') {
			ret = pos[direction];
		}
		return ret;
	};

	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._adventureMapView = opts.adventureMapView;
		this._ongoing = false;

		this._tileX = 0;
		this._tileY = 0;

		this._editMode = opts.editMode;

		/*this._doodadView = new ImageView({
			superview: this
		});*/
		this._itemView = new ImageView({
			superview: this,
			zIndex: 1
		});

		this._idText = new ScoreView({
			superview: this._itemView,
			visible: false,
			blockEvents: true,
		});

		this._characterSettings = null;
		this._locSet = false;

		this._itemCtors = opts.nodeSettings.itemCtors;
		this._hideViews = {};

		this._tileSettings = opts.tileSettings;
		/*this._doodads = opts.tileSettings.doodads;*/
		this._nodes = opts.nodeSettings.nodes;

		this.canHandleEvents(false);
		this._tagViews = {};
	};

	this.update = function (grid, tileX, tileY) {
		this._tileX = tileX;
		this._tileY = tileY;

		var tile = grid[tileY][tileX];
		if (tile && tile.node) {
			var node = this._nodes[tile.node - 1];
			var style = this._itemView.style;
			var x = this._tileSettings.tileWidth * tile.x;
			var y = this._tileSettings.tileHeight * tile.y;

			this.updateOpts({
				width: node.width,
				height: node.height
			});
			if(!this._locSet)
			{
				this.initial = [this.style.x, this.style.y];
				style.x = x - node.width * 0.5;
				style.y = y - node.height * 0.5;
				this.style.x = this.style.x + style.x;
				this.style.y = this.style.y + style.y;
				style.x = 0;
				style.y = 0;
				style.width = node.width;
				style.height = node.height;
				this._locSet = true;
			}

			style.visible = true;
			this._itemView.setImage(node.image);

			this._hideViews = {};
			var itemViews = tile.itemViews;
			if (!itemViews) {
				itemViews = {};
				tile.itemViews = itemViews;
			}

			var hideViews = this._hideViews;
			for (var tag in itemViews) {
				var itemView = itemViews[tag];
				if (itemView.style.visible) {
					hideViews[tag] = itemView;
				}
			}

			for (var tag in tile.tags) {
				if (tag === "Friends") {
					if (!this._tagViews[tag]) {
					this._tagViews[tag] = this._itemCtors[tag].obtainView({
						superview: this,
						ms: tile.id
					});
					}
				} else {
					if (this._itemCtors[tag]) {
						var itemView = this._adventureMapView._nodeItems[tag];
						if (!itemView) {
							itemView = new this._itemCtors[tag]({
								superview: this.getSuperview(),
								adventureMapView: this._adventureMapView,
								zIndex: 999999999,
								tag: tag,
								tile: tile
							});
							this._adventureMapView._nodeItems[tag] = itemView;
						} else {
							itemView.updateOpts({
								superview: this.getSuperview(),
								tile: tile
							});
							itemView.removeAllListeners('InputSelect');
						}
						itemView.show();
						itemView.on('InputSelect', bind(this, 'onSelectTag', tag, tile, itemView));

						if (!('centerTag' in this._tileSettings) || this._tileSettings.centerTag) {
							itemView.style.x = this.style.x + (this.style.width * 0.15);
							itemView.style.y = this.style.y - (itemView.style.height * 0.3 + this.style.height);
						} else {
							itemView.style.x = this.style.x + (this.style.width * 0.15);
							itemView.style.y = this.style.y - (itemView.style.height * 0.3 + this.style.height);
						}
						itemView.update && itemView.update(tile);

						hideViews[tag] = null;
						itemViews[tag] = itemView;
					}
				}
			}

			for (var tag in hideViews) {
				if (hideViews[tag]) {
					itemViews[tag].removeFromSuperview();
					delete itemViews[tag];
				}
			}

			if (tile.id && node.characterSettings && tile.tags && !tile.tags.locked) {
				this._idText.updateOpts({
					x: node.characterSettings.x || 0,
					y: node.characterSettings.y || 0,
					width: node.width,
					height: node.characterSettings.height || node.height,
					visible: true
				});
				this._idText.setCharacterData(node.characterSettings.data);
				this._idText.setText(tile.id);
				if (node.characterSettings !== this._characterSettings) {
					this._characterSettings = node.characterSettings.data;
				}
				this._idText._container.style.x = -10;
				this._idText._container.style.y = (node.height - node.characterSettings.height) * 0.5-30;
			} else {
				this._idText.hide();
			}

			this._itemView.removeAllListeners('InputSelect');
			this._itemView.on('InputSelect', bind(this, 'onSelectNode', tile));
		} else {
			this._itemView.style.visible = false;
		}

		/*if (tile && tile.doodad) {
			var doodad = this._doodads[tile.doodad - 1];
			if (doodad) {
				var style = this._doodadView.style;

				this._doodadView.setImage(doodad.image);
				style.x = tile.doodadX * this._tileSettings.tileWidth - doodad.width * 0.5;
				style.y = tile.doodadY * this._tileSettings.tileHeight - doodad.height * 0.5;
				style.width = doodad.width;
				style.height = doodad.height;
				style.visible = true;
			} else {
				this._doodadView.style.visible = false;
			}
		} else {
			this._doodadView.style.visible = false;
		}*/
		this.style.visible = tile.node;
	};

	this.onSelectTag = function (tag, tile, itemView) {
		this._adventureMapView.emit('ClickTag', tag, tile, itemView);
	};

	this.onSelectNode = function (tile) {
		this._adventureMapView.emit('ClickNode', tile);
	};

	this.refreshLoc = function() {
		this.style.x = this.initial[0];
		this.style.y = this.initial[1];
		this._locSet = false;
	};

	this.onRelease = function (grid, x ,y) {
		var tile = grid[y][x];
		this._idText.hide();
		this.refreshLoc();
		this._itemView.removeAllListeners('InputSelect');
		if ('Friends' in  tile.tags) {
			this._itemCtors['Friends'].releaseView(this._tagViews['Friends']);
			this._tagViews = {};
		}
	}
});
