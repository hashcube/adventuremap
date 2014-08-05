import math.geom.Vec2D as Vec2D;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import ui.ScoreView as ScoreView;
import animate;

import ..ViewPool;

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
		opts.width = opts.tileSettings.tileWidth;
		opts.height = opts.tileSettings.tileHeight;

		supr(this, 'init', [opts]);

		this._adventureMapView = opts.adventureMapView;
		this._superview = opts.superview;
		this._ongoing = false;

		this._itemView = null;

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

		this._idText = null;
		this._characterSettings = null;
		this._addItemEmitter = true;
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
			var x = this.style.width * tile.x;
			var y = this.style.height * tile.y;
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
				if (this._itemCtors[tag]) {
					var itemView = this._adventureMapView._playerView;
					if (!itemView) {
						itemView = new this._itemCtors[tag]({
							superview: this._superview,
							adventureMapView: this._adventureMapView,
							zIndex: 999999999,
							tag: tag,
							tile: tile
						});
						this._adventureMapView._playerView = itemView;
					}
					else {
						itemView.updateOpts({
							tile: tile
						});
						itemView.removeAllListeners('InputSelect');
					}
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
				}
			}

			for (var tag in hideViews) {
				if (hideViews[tag]) {
					hideViews[tag].style.visible = false;
				}
			}

			if (tile.id && node.characterSettings && !tile.tags.locked) {
				if (this._idText) {
					this._idText.style.width = node.width;
					this._idText.style.height = node.characterSettings.height || node.height;
					this._idText.setText(tile.id);
					if (node.characterSettings !== this._characterSettings) {
						this._idText.setCharacterData(node.characterSettings.data);
						this._characterSettings = node.characterSettings.data;
					}
				} else {
					this._idText = new ScoreView({
						superview: this._itemView,
						width: node.width,
						height: node.characterSettings.height || node.height,
						text: tile.id,
						blockEvents: true,
						characterData: node.characterSettings.data
					});
					this._idText._container.style.x = -20;
					this._idText._container.style.y = (node.height - node.characterSettings.height) * 0.5-25;
				}
				this._idText.style.width = node.width;
				this._idText.style.height = node.characterSettings.height || node.height;
				this._idText.style.x = node.characterSettings.x || 0;
				this._idText.style.y = node.characterSettings.y || 0;
				if (node.characterSettings !== this._characterSettings) {
					this._idText.setCharacterData(node.characterSettings.data);
					this._characterSettings = node.characterSettings.data;
				}
			}

			if (this._addItemEmitter) {
				this._addItemEmitter = false;
				this._itemView.on('InputSelect', bind(this, 'onSelectNode', tile));
			}
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

		var friendsView = this._friendsView;
		if (tile && tile.friends.views) {
			var friends = tile.friends,
				views = friends.views,
				tileSettings = this._tileSettings,
				position = friends.position || invert(tile.position) || 'right',
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
				friendsRight = (right && isNaN(parseFloat(friends.x)) && node ? node.width : tileSettings.friendsX),
				friendsBottom = (bottom && isNaN(parseFloat(friends.y)) && node ? node.height : tileSettings.friendsY),
				// position of the container if it is before the milestone icon
				friendsLeft = (left ? friendsWidth : 0),
				friendsTop = (top ? friendsHeight : 0),
				// x and y value for inner views
				x = (deltaX === -1 ? friendsWidth - tileSettings.friendWidth : 0),
				y = (deltaY === -1 ? friendsHeight - tileSettings.friendHeight : 0),
				padding = 25,
				len = views.length,
				view, i;

			if (!friendsView) {
				friendsView = this._friendsView = new View({
					superview: this._superview
				});
				friendsView.on('InputSelect', bind(this, 'onSelectFriends', views, deltaX, deltaY));

				i = len;
				while (i > 0) {
					friendsView.addSubview(views[--i]);
				}
			}

			i = len;
			while (i > 0) {
				view = views[--i];
				view.updateOpts({
					x: x,
					y: y,
					zIndex: i
				});
				x += (padding * deltaX);
				y += (padding * deltaY);
			}

			friendsView.updateOpts({
				x: this.style.x + friends.x * tileSettings.tileWidth - friendsLeft + friendsRight,
				y: this.style.y + friends.y * tileSettings.tileHeight - friendsTop + friendsBottom,
				r: friends.r,
				anchorX: (top || bottom ? friendsWidth / 2 : (left ? friendsWidth : 0)),
				anchorY: (left || right ? friendsHeight / 2 : (top ? friendsHeight : 0)),
				width: friendsWidth,
				height: friendsHeight,
				visible: true
			});
		} else if (friendsView){
			friendsView.hide();
		}

		this.style.visible = tile.node;
	};

	this.onSelectTag = function (tag, tile, itemView) {
		this._adventureMapView.emit('ClickTag', tag, tile, itemView);
	};

	this.onSelectNode = function (tile) {
		this._adventureMapView.emit('ClickNode', tile);
	};

	this.onSelectFriends = function (views, deltaX, deltaY) {
		if(this._ongoing) {
			return;
		}

		var sub = this._friendsView.getSubviews(),
			len = sub.length,
			i = len,
			tileSettings = this._tileSettings,
			valueX, valueY, view, x, y;

		this._ongoing = true;

		while (i > 0) {
			valueX = tileSettings.friendWidth * deltaX * (len - i);
			valueY = tileSettings.friendHeight * deltaY * (len - i);
			view = views[--i];
			x = view.style.x;
			y = view.style.y;

			animate(view, 'friends').then({
				x: x + valueX,
				y: y + valueY,
			}).then({}, 1000).then({
				x: x,
				y: y
			}).then(bind(this, function() {
				this._ongoing = false;
			}));
		}
	};

	this.refreshLoc = function() {
		this.style.x = this.initial[0];
		this.style.y = this.initial[1];
		this._locSet = false;
	};
});
