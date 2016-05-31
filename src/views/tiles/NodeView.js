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
		this.initial = [0, 0];

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

			var itemViews = tile.itemViews;
			if (!itemViews) {
				itemViews = {};
				tile.itemViews = itemViews;
			}

			var hideViews = {};
			for (var tag in itemViews) {
				var itemView = itemViews[tag];
				if (itemView.style.visible) {
					hideViews[tag] = itemView;
				}
			};

			var itemView;
			for (var tag in tile.tags) {
				hideViews[tag] = null;
				if (this._itemCtors[tag]) {
					if (tag === "Friends") {
						itemView = tile.itemViews[tag];
						if (!itemView) {
							var position = tile.friends.position || invert(tile.position) || 'right',
								friends = tile.friends,
								tileSettings = this._tileSettings,
								left = (position === 'left'),
								right = (position === 'right'),
								top = (position === 'top'),
								bottom = (position === 'bottom'),
								deltaX = (left ? -1 : (right ? 1 : 0)),
								deltaY = (top ? -1 : (bottom ? 1 : 0)),
								// with and height of the container
								friendsWidth =  (left || right ? friends.width : friends.height),
								friendsHeight = (left || right ? friends.height : friends.width),
								// position of the container if it is after the milestone icon
								// if position is right, then x position should come after the node, on left it should be 0, before the node
								// otherwise (top and bottom) it should take x value from tile settings.
								friendsRight = (right && isNaN(parseFloat(friends.x)) && node ? node.width : (left ? 0 : tileSettings.friendsX)),
								// if position is bottom, then y position should come after the node, on top it should be 0, before the node
								// otherwise (left and right) it should take y value from tile settings.
								friendsBottom = (bottom && isNaN(parseFloat(friends.y)) && node ? node.height : (top ? 0 : tileSettings.friendsY)),
								// position of the container if it is before the milestone icon
								friendsLeft = (left ? friendsWidth : 0),
								friendsTop = (top ? friendsHeight : 0),
								// x and y value for inner views
								x = (deltaX === -1 ? friendsWidth - tileSettings.friendWidth : 0),
								y = (deltaY === -1 ? friendsHeight - tileSettings.friendHeight : 0);

							itemView = itemViews[tag] = this._itemCtors[tag].obtainView({
								superview: this.getSuperview(),
								ms: tile.id,
								x: this.style.x + friends.x * tileSettings.tileWidth - friendsLeft + friendsRight,
								y: this.style.y + friends.y * tileSettings.tileHeight - friendsTop + friendsBottom
							});
						}
					} else {
						itemView = this._adventureMapView._nodeItems[tag];
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

						itemViews[tag] = itemView;
						if (!('centerTag' in this._tileSettings) || this._tileSettings.centerTag) {
							itemView.style.x = this.style.x + (this.style.width * 0.15);
							itemView.style.y = this.style.y - (itemView.style.height * 0.3 + this.style.height);
						} else {
							itemView.style.x = this.style.x + (this.style.width * 0.15);
							itemView.style.y = this.style.y - (itemView.style.height * 0.3 + this.style.height);
						}
						itemView.update && itemView.update(tile);
					}
				}
			}

			for (var tag in hideViews) {
				if (hideViews[tag]) {
					if (hideViews[tag]._obtainedFromPool) {
						this._itemCtors[tag].releaseView(itemViews[tag]);
					} else {
						itemViews[tag].removeFromSuperview();
					}
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

	this.onReleaseNode = function (grid, x, y) {
		var tile = grid[y][x];
		this._idText.hide();
		this.refreshLoc();
		this._itemView.removeAllListeners('InputSelect');

		for (tag in tile.tags) {
			if (tile.itemViews[tag] && tile.itemViews[tag]._obtainedFromPool) {
				this._itemCtors[tag].releaseView(tile.itemViews[tag])
			}
			delete tile.itemViews[tag];
		}
	}
});
