import event.Emitter as Emitter;

import .models.AdventureMapModel as AdventureMapModel;

import .views.AdventureMapView as AdventureMapView;
import .views.editor.Editor as Editor;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		// To support if chapterSettings not passed. Else code breaks
		opts.chapterSettings = opts.chapterSettings || {};

		this._model = new AdventureMapModel({
			tileWidth: opts.tileSettings.tileWidth,
			tileHeight: opts.tileSettings.tileHeight,
			width: opts.gridSettings.width,
			height: opts.gridSettings.height,
			defaultTile: opts.gridSettings.defaultTile
		});

		var tileSettings = opts.tileSettings;
		var gridSettings = opts.gridSettings;

		this._gridSettings = gridSettings;
		this._tileSettings = tileSettings;
		this._pathSettings = opts.pathSettings;
		this._nodeSettings = opts.nodeSettings;
		this._chapterSettings = opts.chapterSettings;

		opts.map = this._model.getMap();

		this._adventureMapView = new AdventureMapView(opts, this._model);

		if (opts.editMode) {
			new Editor({
				superview: opts.superview,
				x: 0,
				y: 0,
				tileSettings: opts.tileSettings,
				gridSettings: opts.gridSettings,
				nodeSettings: opts.nodeSettings,
				pathSettings: opts.pathSettings,
				chapterSettings: opts.chapterSettings,
				width: opts.width,
				height: opts.height,
				adventureMap: this
			});
		}

		this._pinchSet = 0;
		this._pinchUp = 0;
		this._pinchReset = 0;
		this._pinchScale = null;
		this._dragSingleCount = 0;

		this._adventureMapView.on('Dragged', bind(this, 'emit', 'Dragged'));
		this._adventureMapView.on('Size', bind(this._model, 'onSize'));
		this._adventureMapView.on('ClickTag', bind(this, 'onClickTag'));
		this._adventureMapView.on('ClickNode', bind(this, 'onClickNode'));

		this._model.on('NeedsPopulate', bind(this._adventureMapView, 'needsPopulate'));
		this._model.on('Update', bind(this._adventureMapView, 'onUpdate'));
		this._model.on('UpdateTile', bind(this._adventureMapView, 'refreshTile'));
		this._model.on('UpdateNode', bind(this._adventureMapView, 'refreshNode'));

		this._adventureMapView.tick = bind(this, function(dt) {
			this._adventureMapView.style.visible && this._model.tick(dt);
		});
	};

	this.getModel = function () {
		return this._model;
	};

	this.getAdventureMapView = function () {
		return this._adventureMapView;
	};

	this.getAdventureMapLayers = function () {
		return this._adventureMapView.getAdventureMapLayers();
	};

	this.setScale = function (scale) {
		this._adventureMapView.setScale(scale);
	};

	this.load = function (data) {
		this._model.load(data);
		this._adventureMapView.onUpdate(this._model.getData());
	};

	this.hide = function () {
		this._adventureMapView.hide();
	};

	this.show = function () {
		this._adventureMapView.show();
	};

	this.refreshTile = function (tileX, tileY) {
		this._adventureMapView.refreshTile(tileX, tileY);
	};

	this.refreshAll =  function() {
		this._adventureMapLayers.refreshAll();
	};

	this.onClickTag = function (tag, tile, view) {
		this.emit('ClickTag', tag, tile, view);
	};

	this.getPlayerPosition = function(view) {
		return this._adventureMapView._nodeItems.Player.getPosition(view);
	};

	this.onClickNode = function (tile) {
		this.emit('ClickNode', tile);
	};

	this.focusNodeById = function (id, cb) {
		var node = this._model.getNodesById()[id];
		node && this._adventureMapView.focusNodeById(node, cb);
	};

	this.getNodePosition = function(id) {
		var node = this._model.getNodesById()[id];
		return node && this._adventureMapView.getNodePosition(node);
	};

	this.getRelativeNodePosition = function (id, view) {
		var node = this._model.getNodesById()[id];
		return node && this._adventureMapView.getRelativeNodePosition(node, view);
	};
});
