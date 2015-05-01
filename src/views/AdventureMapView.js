import ui.View as View;
import ui.ScrollView as ScrollView;

import .AdventureMapBackgroundView;
import .AdventureMapPathsView;
import .AdventureMapNodesView;
import .AdventureMapDoodadsView;
import math.geom.Point as Point;

exports = Class(ScrollView, function (supr) {
	var calls = 0;
	var calls_lf = 0;

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

	this.init = function (opts, model) {
		this._model = model;
		this._tileWidth = opts.tileSettings.tileWidth;
		this._tileHeight = opts.tileSettings.tileHeight;

		this._gridSettings = opts.gridSettings;

		this._totalWidth = opts.gridSettings.width * this._tileWidth;
		this._totalHeight = opts.gridSettings.height * this._tileHeight;

		this._touch = {};
		this._touchIDs = [];

		//playerview, to track a player
		this._playerView = null;

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

		this._pinch = false;
		this._pinchScale = 1;
		this._pinchPoints = {};
		this._pinchStartDistance = 0;

		var ctors = [
				AdventureMapBackgroundView,
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
				editMode: opts.editMode,
				blockEvents: opts.editMode ? (i !== 0) : (i < 2),
				poolSize: v_head * h_head
			}));
		}

		this.on('Scrolled', bind(this, function (point) {
			var adventureMapLayer = this._adventureMapLayers[0];
			this.move(point.x, point.y);
		}));
	};

	this.onUpdate = function (data) {
		data.pos = this.getPosition();
		for (var i = 0; i < 4; i++) {
			var adventureMapLayer = this._adventureMapLayers[i];
			if (adventureMapLayer && adventureMapLayer.onUpdate) {
				adventureMapLayer.onUpdate(data);
			}
		}

		this._showTimeout = this._showTimeout || setTimeout(
			bind(this, function () {
				for (var i = 0; i < 3; i++) {
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
					this._anim.clear();
				}

				evt.cancel();
			}
		}
		/*
		this._touch['_' + evt.id] = true;
		this._touchIDs = Object.keys(this._touch);
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
		*/
	};

	this.onInputSelect = this.onInputOut = function (evt) {
		/*
		if ('id' in evt) {
			delete this._touch['_' + evt.id];
			this._touchIDs = Object.keys(this._touch);
		}
		*/
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
		if (this._pinch) {
			if ('id' in dragEvt) {
				delete this._touch['_' + dragEvt.id];
				this._touchIDs = Object.keys(this._touch);
			}
			if ('id' in selectEvt) {
				delete this._touch['_' + selectEvt.id];
				this._touchIDs = Object.keys(this._touch);
			}
			if (this._touchIDs.length < 2) {
				this._pinch = false;
			}
		} else {
			if ('id' in dragEvt) {
				delete this._touch['_' + dragEvt.id];
				this._touchIDs = Object.keys(this._touch);
			}
			if ('id' in selectEvt) {
				delete this._touch['_' + selectEvt.id];
				this._touchIDs = Object.keys(this._touch);
			}
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
		this._adventureMapLayers[2].refreshNode(tileX, tileY);
	};

	this.focusNodeById = function (node, cb) {
		var scale = this._content.style.scale;
		var pos = this.getPosition('slider');

		var x = Math.max((node.tileX * this._tileSettings.tileWidth) * scale - this.style.width * 0.5, 0);
		var y = Math.max((node.tileY * this._tileSettings.tileHeight) * scale - this.style.height * 0.5, 0);

		this.scrollTo(x, y, 300, cb);

		var x_head = Math.max((pos.h[1] * this._tileSettings.tileWidth) * scale - this.style.width * 0.5, 0);
		var y_head = Math.max((pos.v[1] * this._tileSettings.tileHeight) * scale - this.style.height * 0.5, 0);
		var point = new Point(x_head, y_head);
		point.subtract(x, y);

		this.move(point.x, point.y);
	};

	this.getNodePosition = function (node) {
		var pos = this._adventureMapLayers[2]._views[node.tileY][node.tileX].getPosition(),
			scale = this._content.style.scale,
			tileWidth = this._tileSettings.tileWidth,
			tileHeight = this._tileSettings.tileHeight;
		return {
			x: pos.x + tileWidth*scale*(node.x-1),
			y: pos.y + tileHeight*scale*(node.y-1)
		};
	};

	this.removeItemViews = function () {
		this._adventureMapLayers[3].removeItemViews();
	};

	this.move = function (x, y) {
		var posX = Math.ceil(Math.abs(x));
		var posY = Math.ceil(Math.abs(y));

		if (x < 0) {
			this.populateRow(posX);
		} else if (x > 0) {
			this.populateRowLeft(posX);
		}

		if (y < 0) {
			this.populateColumn(posY);
		} else if (y > 0) {
			this.populateColumnTop(posY);
		}
	}

	this.populateRow = function (count) {
		var tileWidth = this._tileWidth;
		var tileHeight = this._tileHeight;
		var width = this._gridSettings.height;
		var height = this._gridSettings.height;

		var margin = this._editMode ? 8 : 0;
		var num = 1;
		var swap = false;
		var cell_size = tileWidth;
		var tile = this._adventureMapLayers[0];

		calls += count;
		if (calls < cell_size) {
			return;
		} else {
			num = Math.floor(calls/cell_size);
			calls = Math.floor(calls % cell_size);
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

				for (var x = h_head; x <= end; x++) {
					var rel = h_tail + (end - x);
					this.create(x, y, rel);
				}
				this._views[y] = line;
			}
			h_head += num;
			h_tail += num;
		}
	};

	this.populateRowLeft = function (count) {
		var tileWidth = this._tileWidth;
		var tileHeight = this._tileHeight;
		var width = this._gridSettings.height;
		var height = this._gridSettings.height;

		var margin = this._editMode ? 8 : 0;
		var num = 1;
		var swap = false;
		var cell_size = tileWidth;
		var tile = this._adventureMapLayers[0];

		calls += count;
		if (calls < cell_size) {
			return;
		} else {
			num = Math.floor(calls/cell_size);
			calls = Math.floor(calls % cell_size);
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
				var line = this._views[y];

				for (var x = h_tail - 1; x >= end; x--) {
					var rel = h_head - (h_tail - x);
					this.create(x, y, rel);
				}
				this._views[y] = line;
			}
			h_head -= num;
			h_tail -= num;
		}
	};

	this.populateColumn = function (count) {
		var tileWidth = this._tileWidth;
		var tileHeight = this._tileHeight;
		var width = this._gridSettings.height;
		var height = this._gridSettings.height;

		var margin = this._editMode ? 8 : 0;
		var num = 1;
		var swap = false;
		var cell_size = tileHeight;
		var tile = this._adventureMapLayers[0];

		calls_lf += count;
		if (calls_lf < cell_size) {
			return;
		} else {
			num = Math.floor(calls_lf/cell_size);
			calls_lf = Math.floor(calls_lf % cell_size);
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
					this.create(x, y, rel);
				}
			}
			v_head += num;
			v_tail += num;
		}
	};

	this.populateColumnTop = function (count) {
		var tileWidth = this._tileWidth;
		var tileHeight = this._tileHeight;
		var width = this._gridSettings.height;
		var height = this._gridSettings.height;

		var margin = this._editMode ? 8 : 0;
		var num = 1;
		var swap = false;
		var cell_size = tileHeight;
		var tile = this._adventureMapLayers[0];

		calls_lf += count;
		if (calls_lf < cell_size) {
			return;
		} else {
			num = Math.floor(calls_lf/cell_size);
			calls_lf = Math.floor(calls_lf % cell_size);
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

		// right end condition
		if (v_slider_head + v_padding < v_head) {
			var end = v_tail - num;

			for (var y = v_tail - 1; y >= end; y--) {
				for (var x = h_tail; x < h_head; x++) {
					var rel = v_head - (v_tail - y);
					this.create(x, y, rel);
				}
			}
			v_head -= num;
			v_tail -= num;
		}
	};

	this.create = function (x, y, rel) {
		var data = this._model.getData().grid;
		this._adventureMapLayers.forEach(function (layer) {
			layer.release && layer.release(x, rel);
			layer.create && layer.create(x, y, data);
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
