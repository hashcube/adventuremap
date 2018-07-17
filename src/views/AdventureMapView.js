import ui.View as View;
import ui.ScrollView as ScrollView;

import .AdventureMapBackgroundView;
import .AdventureMapPathsView;
import .AdventureMapNodesView;
import .AdventureMapDoodadsView;
import .AdventureMapChaptersView;
import math.geom.Point as Point;

exports = Class(ScrollView, function (supr) {
	var h_calls = 0;
	var v_calls = 0;

	var h_padding = 10;
	var v_padding = 10;

	var h_slider_head = 20;
	var h_slider_tail = 0;
	var v_slider_head = 20;
	var v_slider_tail = 0;

	var v_head = 20 + v_padding * 2;
	var v_tail = 0;
	var h_head = 20 + h_padding*2;
	var h_tail = 0;

	this.init = function (opts, model) {
		var width, height,
			editMode = opts.editMode;

		this._model = model;
		this._tileWidth = opts.tileSettings.tileWidth;
		this._tileHeight = opts.tileSettings.tileHeight;

		this._gridSettings = opts.gridSettings;

		width = opts.gridSettings.width;
		height = opts.gridSettings.height;
		this._totalWidth = width * this._tileWidth;
		this._totalHeight = height * this._tileHeight;

		if (h_slider_head > width) {
			h_slider_head = width;
			h_head = width;
			h_padding = 0;
		}
		if (v_slider_head > height) {
			v_slider_head = height;
			v_head = height;
			v_padding = 0;
		}
		/*	By setting v_slider values to height we are moving the scroller to
			bottom corner, Horizontal sliders are already at left, so the map
			start rendering from bottom-left corner
		*/
		v_slider_tail = height - v_slider_head;
		v_slider_head = height;
		v_tail = v_slider_tail - 2 * v_padding;
		v_head = height;
		if (v_tail < 0) {
			v_tail = 0;
		}

		if (h_head > width) {
			h_head = width;
			h_padding = width - h_slider_head;
		}
		if (v_head > height) {
			v_head =  height;
			v_padding = height - v_slider_head;
		}

		this._touch = {};
		this._touchIDs = [];

		//playerview, to track a player
		this._nodeItems = {};

		var scale = opts.scale || 1;

		opts = merge(
			opts,
			{
				scrollX: true,
				scrollY: true,
				scrollBounds: {
					minX: 0,
					minY: 0,
					maxX: this._totalWidth * scale,
					maxY: this._totalHeight * scale
				},
				bounce: false,
				minScale: 0.5,
				maxScale: 2
			}
		);

		supr(this, 'init', [opts]);

		this._minScale = opts.minScale;
		this._maxScale = opts.maxScale;
		this._tileSettings = opts.tileSettings;
		this._adventureMapLayers = [];
		this._inputLayerIndex = opts.inputLayerIndex;

		this._showTimeout = null;

		this._fingerOne = null;
		this._fingerTwo = null;

		this._content = new View({
			superview: this,
			x: 0,
			y: 0,
			width: this._totalWidth,
			height: this._totalHeight,
			scale: scale
		});

		// Scrolled to the bottom initally
		// TODO: Needed ?
		this._contentView.updateOpts({
			y: -this.getStyleBounds().maxY,
		});

		this._pinch = false;
		this._pinchScale = 1;
		this._pinchPoints = {};
		this._pinchStartDistance = 0;

		var ctors = [
				AdventureMapBackgroundView,
				AdventureMapChaptersView,
				AdventureMapPathsView,
				AdventureMapNodesView
			];
		for (var i = 0; i < ctors.length; i++) {
			this._adventureMapLayers.push(new ctors[i]({
				superview: this._content,
				adventureMapView: this,
				x: 0,
				y: 0,
				width: this._totalWidth,
				height: this._totalHeight,
				map: opts.map,
				tileCtor: ctors[i],
				tileSettings: opts.tileSettings,
				gridSettings: opts.gridSettings,
				nodeSettings: opts.nodeSettings,
				pathSettings: opts.pathSettings,
				chapterSettings: opts.chapterSettings,
				editMode: editMode,
				blockEvents: opts.editMode ? (i !== 0) : (i < 2),
				poolSize: v_head * h_head
			}));
		}

		this.editMode = editMode;

		if (!editMode) {
			this.on('Scrolled', bind(this, function (point) {
				var x = point.x || 0,
					y = point.y || 0;

				var adventureMapLayer = this._adventureMapLayers[0];
				this.move(x, y);
			}));
		}
	};

	this.onUpdate = function (data) {
		var width = this._gridSettings.width,
			height = this._gridSettings.height;

		if (this.editMode) {
			for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {
					this.create(x, y);
				}
			}
		}

		data.pos = this.getPosition();
		for (var i = 0; i < 5; i++) {
			var adventureMapLayer = this._adventureMapLayers[i];
			if (adventureMapLayer && adventureMapLayer.onUpdate) {
				adventureMapLayer.onUpdate(data);
			}
		}

		this._showTimeout = this._showTimeout || setTimeout(
			bind(this, function () {
				for (var i = 0; i < 4; i++) {
					this._adventureMapLayers[i].style.visible = true;
				}
			}),
			0
		);
	};

	this.onPinch = function (pinchScale) {
		this.setScale(pinchScale);
	};

	this.onInputStart = function (evt, pt) {
		if (!this._touchIDs.length) {
			if (this._opts.drag) {
				this.startDrag({radius: this._opts.dragRadius * this._snapPixels});

				if (this._anim && this._anim.hasFrames()) {
					this._contentView.getInput().blockEvents = false;
					this._anim.clear();
				}

				evt.cancel();
			}
		}

		// Take only the first tap/finger
		// TODO: additional condition to allow pinch
		if (this._touchIDs.length === 0) {
			this._touch['_' + evt.id] = true;
			this._touchIDs = Object.keys(this._touch);
		} else {
			return;
		}

		switch (this._touchIDs.length) {
			case 1:
				this._fingerOne = this._touchIDs[0];
				this._pinchPoints[this._fingerOne] = {x: evt.srcPoint.x, y: evt.srcPoint.y};
				break;
			case 2:
				this._fingerTwo = this._touchIDs[1];
				this._pinchPoints[this._fingerTwo] = {x: evt.srcPoint.x, y: evt.srcPoint.y};
				break;
		}
		if (this._touchIDs.length === 2) {
			this._pinchScale = this.getScale();
			this._pinchStartDistance = this.getPinchDistance();
			this._pinch = true;
		} else {
			this._pinch = false;
		}
	};

	this.onInputSelect = this.onInputOut = function (evt) {
		if ('id' in evt) {
			delete this._touch['_' + evt.id];
			this._touchIDs = Object.keys(this._touch);
		}
	};

	this.onDrag = function (dragEvt, moveEvt, delta) {
		this.emit('Dragged');

		if (this._pinch) {
			this._pinchPoints['_' + moveEvt.id] = {x: moveEvt.srcPoint.x, y: moveEvt.srcPoint.y};
			this.setScale(this.getPinchDistance() / this._pinchStartDistance * this._pinchScale);
		} else {
			supr(this, 'onDrag', arguments);
		}
	};

	this.onDragStop = function (dragEvt, selectEvt) {
		if ('id' in dragEvt) {
			delete this._touch['_' + dragEvt.id];
			this._touchIDs = Object.keys(this._touch);
		}
		if ('id' in selectEvt) {
			delete this._touch['_' + selectEvt.id];
			this._touchIDs = Object.keys(this._touch);
		}

		if (this._pinch) {
			if (this._touchIDs.length < 2) {
				this._pinch = false;
			}
			this._contentView.getInput().blockEvents = false;
		} else {
			supr(this, 'onDragStop', arguments);
		}
	};

	this.setOffset = function (x, y) {
		(this._touchIDs.length <= 1) && supr(this, 'setOffset', arguments);
	};

	this.getAdventureMapLayers = function () {
		return this._adventureMapLayers;
	};

	this.getTileWidth = function () {
		return this._tileWidth;
	};

	this.getTileHeight = function () {
		return this._tileHeight;
	};

	this.getScale = function (scale) {
		return this._content.style.scale;
	};

	this.setScale = function (scale) {
		var lastScale = this._content.style.scale;
		scale = Math.min(Math.max(scale, this._minScale), this._maxScale);

		this._content.style.scale = scale;

		var x = this._contentView.style.x * scale / lastScale + (lastScale - scale) * this.style.width * 0.5;
		var y = this._contentView.style.y * scale / lastScale + (lastScale - scale) * this.style.height * 0.5;

		this._contentView.style.x = Math.min(Math.max(x, -(this._totalWidth * scale - this.style.width)), 0);
		this._contentView.style.y = Math.min(Math.max(y, -(this._totalHeight * scale - this.style.height)), 0);

		this.setScrollBounds({
			minX: 0,
			minY: 0,
			maxX: this._totalWidth * scale,
			maxY: this._totalHeight * scale
		});
	};

	this.getPinchDistance = function () {
		var p1 = this._pinchPoints[this._fingerOne];
		var p2 = this._pinchPoints[this._fingerTwo];
		var dx = p2.x - p1.x;
		var dy = p2.y - p1.y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	this.refreshTile = function (tileX, tileY) {
		var adventureMapLayers = this._adventureMapLayers;
		var i = this._adventureMapLayers.length;

		while (i) {
			this._adventureMapLayers[--i].refreshTile(tileX, tileY);
		}
	};

	this.refreshNode = function (tileX, tileY) {
		var adventureMapLayers = this._adventureMapLayers;
		// 2 is node view
		this._adventureMapLayers[3].refreshNode(tileX, tileY);
	};

	this.focusNodeById = function (node, cb) {
		var scale = this._content.style.scale;
		var pos = this.getPosition('slider');
		var x_head, y_head;
		var h_dir = node.tileX - pos.h[1] > 0 ? 1 : 0;
		var v_dir = node.tileY - pos.v[1] > 0 ? 1 : 0;

		var x = Math.max((node.tileX * this._tileSettings.tileWidth) * scale - this.style.width * 0.5, 0);
		var y = Math.max((node.tileY * this._tileSettings.tileHeight) * scale - this.style.height * 0.5, 0);

		this.scrollTo(x, y, 300, cb);

		// based on the direction of scroll we need to move the map & fill the tiles
		x_head = Math.max((pos.h[h_dir] * this._tileSettings.tileWidth) * scale - this.style.width * 0.5, 0);
		y_head = Math.max((pos.v[v_dir] * this._tileSettings.tileHeight) * scale - this.style.height * 0.5, 0);
		var point = new Point(x_head, y_head);
		point.subtract(x, y);

		this.move(point.x, point.y);
	};

	this.getNodePosition = function (node) {
		var pos = this._adventureMapLayers[3]._views[node.tileY][node.tileX].getPosition(),
			scale = this._content.style.scale,
			tileWidth = this._tileSettings.tileWidth,
			tileHeight = this._tileSettings.tileHeight;
		return {
			x: pos.x + tileWidth * scale * (node.x - 1),
			y: pos.y + tileHeight * scale * (node.y - 1)
		};
	};

	this.getRelativeNodePosition = function (node, view) {
		var pos = this._adventureMapLayers[3]._views[node.tileY][node.tileX].getPosition(view);

		return {
			x: pos.x,
			y: pos.y
		};
	};

	this.removeItemViews = function () {
		this._adventureMapLayers[4].removeItemViews();
	};

	this.move = function (x, y) {
		var posX = Math.ceil(Math.abs(x));
		var posY = Math.ceil(Math.abs(y));
		var toScrollMin = 2 * v_padding * this._tileHeight; //no logic here, just picking a large value

		if (x < 0) {
			this.populateRight(posX);
		} else if (x > 0) {
			this.populateLeft(posX);
		}

		if (y < 0) {
			this.populateBottom(posY);
		} else if (y > 0) {
			if(posY > toScrollMin) {
				this.populateLargeTop(posY);
			} else {
				this.populateTop(posY);
			}
		}
	};

	this.populateLargeTop = function (count) {
		var num = Math.floor(count / this._tileHeight),
			end, x, y, i;

		// Handle reaching end of map
		if (v_tail -num < 0) {
			num = v_tail;
		}
		end = v_tail - num;
		v_slider_tail -= num;
		v_slider_head -= num;
		v_tail = v_slider_head + v_padding;

		for (y = v_head; y >= v_head - (v_tail - end); y--) {
			for (x = h_tail; x < h_head; x++) {
				this.create(undefined, undefined, x, y);
			}
		}

		for(y = v_tail - 1; y >= end; y--) {
			for (x = h_tail; x < h_head; x++) {
				this.create(x, y);
			}
		}

		v_head -= num;
		v_tail = v_slider_tail - 2 * v_padding;
	};

	this.populateRight = function (count) {
		var width = this._gridSettings.width;
		var num = 1;
		var cell_size = this._tileWidth;
		var old = h_calls;

		h_calls += count;
		var nonflip = old * h_calls >= 0;

		if (nonflip && h_calls < cell_size) {
			return;
		} else {
			num = Math.floor(h_calls/cell_size);
			if (!nonflip && num === 0) {
				num = 1;
			}
			h_calls = Math.floor(h_calls % cell_size);
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
				for (var x = h_head; x <= end; x++) {
					var rel = h_tail + (end - x);
					this.create(x, y, rel, y);
				}
			}
			h_head += num;
			h_tail += num;
		}
	};

	this.populateLeft = function (count) {
		var num = 1;
		var cell_size = this._tileWidth;
		var old = h_calls;

		h_calls -= count;
		var nonflip = old * h_calls >= 0;

		if (nonflip && h_calls * -1 < cell_size) {
			return;
		} else {
			num = Math.floor(h_calls * -1 / cell_size);
			if (!nonflip && num === 0) {
				num = 1;
			}
			h_calls = Math.floor(h_calls % cell_size);
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

		// right end condition
		if (h_slider_tail - h_padding < h_tail) {
			var end = h_tail - num;

			for (var y = v_tail; y < v_head; y++) {
				for (var x = h_tail - 1; x >= end; x--) {
					var rel = h_head - (h_tail - x);
					this.create(x, y, rel, y);
				}
			}
			h_head -= num;
			h_tail -= num;
		}
	};

	this.populateBottom = function (count) {
		var height = this._gridSettings.height;
		var num = 1;
		var cell_size = this._tileHeight;
		var old = v_calls;

		v_calls += count;
		var nonflip = old * v_calls >= 0;

		if (nonflip && v_calls < cell_size) {
			return;
		} else {
			num = Math.floor(v_calls/cell_size);
			if (!nonflip && num === 0) {
				num = 1;
			}
			v_calls = Math.floor(v_calls % cell_size);
		}

		if (v_slider_head + num > height) {
			v_slider_tail = height - (v_slider_head - v_slider_tail);
			v_slider_head = height;
		} else {
			v_slider_tail += num;
			v_slider_head += num;
		}

		if (v_head + num > height) {
			num = height - v_head;
		}

		if (v_slider_tail - v_padding > v_tail) {
			var end = v_head + num - 1;

			for (var y = v_head; y <= end; y++) {
				var rel = v_tail + (y - v_head);
				for (var x = h_tail; x < h_head; x++) {
					this.create(x, y, x, rel);
				}
			}
			v_head += num;
			v_tail += num;
		}
	};

	this.populateTop = function (count) {
		var height = this._gridSettings.height;
		var num = 1;
		var cell_size = this._tileHeight;
		var old = v_calls;

		v_calls -= count;
		var nonflip = old * v_calls >= 0;

		if (nonflip && v_calls * -1 < cell_size) {
			return;
		} else {
			num = Math.floor(v_calls * -1 /cell_size);
			if (!nonflip && num === 0) {
				num = 1;
			}
			v_calls = Math.floor(v_calls % cell_size);
		}

		//set proper slider values if end of map is reached
		if (v_slider_tail - num < 0) {
			v_slider_head = (v_slider_head - v_slider_tail);
			v_slider_tail = 0;
		} else {
			v_slider_tail -= num;
			v_slider_head -= num;
		}

		if (v_tail - num < 0) {
			num = v_tail;
		}

		if (v_slider_head + v_padding < v_head) {
			var end = v_tail - num;
			for (var y = v_tail - 1; y >= end; y--) {
				var rel = v_head - (v_tail - y);
				for (var x = h_tail; x < h_head; x++) {
					this.create(x, y, x, rel);
				}
			}
			v_head -= num;
			v_tail -= num;
		}
	};

	this.create = function (x, y, release_x, release_y) {
		var data = this._model.getData().grid;
		this._adventureMapLayers.forEach(function (layer) {
			if (release_x !== undefined && release_y !== undefined && layer.release) {
				layer.release(release_x, release_y);
			}
			if (x !== undefined && y !== undefined && layer.create) {
				layer.create(x, y, data);
			}
		});
	};

	this.getPosition = function (type) {
		var ret;

		if (type === 'slider') {
			ret = {
				v: [v_slider_tail, v_slider_head],
				h: [h_slider_tail, h_slider_head]
			};
		} else {
			ret = {
				v: [v_tail, v_head],
				h: [h_tail, h_head]
			};
		}

		return ret;
	};
});
