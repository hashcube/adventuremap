import ui.View as View;
import ui.ScrollView as ScrollView;
import ui.GestureView as GestureView;

import .AdventureMapBackgroundView;
import .AdventureMapPathsView;
import .AdventureMapNodesView;
import .AdventureMapDoodadsView;

exports = Class(ScrollView, function (supr) {
	this.init = function (opts) {
		this._tileWidth = opts.tileSettings.tileWidth;
		this._tileHeight = opts.tileSettings.tileHeight;

		this._totalWidth = opts.gridSettings.width * this._tileWidth;
		this._totalHeight = opts.gridSettings.height * this._tileHeight;

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
				bounce: false
			}
		);

		supr(this, 'init', [opts]);

		this._tileSettings = opts.tileSettings;
		this._adventureMapLayers = [];
		this._inputLayerIndex = opts.inputLayerIndex;

		this._showTimeout = null;

		this._fingerOne = null;
		this._fingerTwo = null;

		this._touchIDs = [];

		this._content = new View({
			superview: this,
			x: 0,
			y: 0,
			width: this._totalWidth,
			height: this._totalHeight,
			scale: scale
		});

		var ctors = [
				AdventureMapBackgroundView,
				AdventureMapPathsView,
				AdventureMapNodesView,
				AdventureMapDoodadsView
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
				gridSettings: opts.gridSettings,
				tileCtor: ctors[i],
				tileSettings: opts.tileSettings,
				gridSettings: opts.gridSettings,
				nodeSettings: opts.nodeSettings,
				pathSettings: opts.pathSettings,
				editMode: opts.editMode,
				blockEvents: opts.editMode ? (i !== 0) : (i < 2)
			}));
		}
	};

	this.onUpdate = function (data) {
		for (var i = 0; i < 4; i++) {
			var adventureMapLayer = this._adventureMapLayers[i];
			adventureMapLayer && adventureMapLayer.onUpdate && adventureMapLayer.onUpdate(data);
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
		supr(this, 'onInputStart', arguments);
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

	this.setScale = function (scale) {
		this._content.style.scale = scale;

		this.setScrollBounds({
			minX: 0,
			minY: 0,
			maxX: this._totalWidth * scale,
			maxY: this._totalHeight * scale
		});
		this.scrollTo(this.style.x * scale, this.style.y * scale, 0);
	};

	this.refreshTile = function (tileX, tileY) {
		var adventureMapLayers = this._adventureMapLayers;
		var i = this._adventureMapLayers.length;

		while (i) {
			this._adventureMapLayers[--i].refreshTile(tileX, tileY);
		}		
	};

	this.focusNodeById = function (node) {
		var scale = this._content.style.scale;
		var x = Math.max((node.tileX * this._tileSettings.tileWidth) * scale - this.style.width * 0.5, 0);
		var y = Math.max((node.tileY * this._tileSettings.tileHeight) * scale - this.style.height * 0.5, 0);

		this.scrollTo(x, y, 300);
	};

	this.removeItemViews = function () {
		this._adventureMapLayers[3].removeItemViews();
	};
});