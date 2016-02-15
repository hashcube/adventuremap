import device;
import animate;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.ImageScaleView as ImageScaleView;
import ui.TextView as TextView;
import ui.ScrollView as ScrollView;

import .components.TopBar as TopBar;
import .components.EditButton as EditButton;

var InputPrompt = device.get('InputPrompt');

exports = Class(TopBar, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		var size = this.style.height;

		this._size = size;

		var options = [
				{title: 'Position', method: 'onPosition', style: 'GREEN'},
				{title: 'Node', method: 'onNode', style: 'GREEN'},
				{title: 'Tags', method: 'onTags', style: 'GREEN'},
				{title: 'Id', method: 'onId', style: 'GREEN'},
				{title: 'Rotate', method: 'onRotate', style: 'GREEN'},
				{title: 'Friends', method: 'onFriends', style: 'GREEN'},
				{title: 'Bottom', method: 'onBottom', style: 'GREEN'},
				{title: 'Right', method: 'onRight', style: 'GREEN'},
				{title: 'Rt Top', method: 'onRightTop', style: 'GREEN'},
				{title: 'Rt Botm', method: 'onRightBottom', style: 'GREEN'},
				{title: 'Tile', method: 'onTile', style: 'GREEN'},
				{title: 'Doodad', method: 'onDoodad', style: 'GREEN'},
				{title: 'Text', method: 'onText', style: 'GREEN'},
				{title: 'Zoom', method: 'onZoom', style: 'GREEN'},
				{title: 'Clear', method: 'onClear', style: 'RED'},
				{title: 'Export', method: 'onExport', style: 'BLUE'}
			];

		var scrollView = new ScrollView({
			superview: this,
			x: 0,
			y: 0,
			width: this.style.width - size,
			height: size,
			scrollX: true,
			scrollY: false,
			scrollBounds: {
				minX: 0,
				maxX: options.length * 136 + 4,
				minY: 0,
				maxY: 0
			}
		});

		var x = 4;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			new EditButton({
				superview: scrollView,
				x: x,
				y: 4,
				width: 140,
				height: size - 8,
				title: option.title,
				style: option.style
			}).on('Up', bind(this, option.method));
			x += 136;
		}

		new EditButton({
			superview: this,
			x: this.style.width - size + 4,
			y: 4,
			width: size - 8,
			height: size - 8,
			icon: {
				image: 'modules/adventuremap/images/ui/buttonClose.png',
				x: (size - 8) * 0.2,
				y: (size - 8) * 0.18,
				width: (size - 8) * 0.6,
				height: (size - 8) * 0.6
			},
			style: 'RED'
		}).on('Up', bind(this, 'onClose'));

		this._prompt = new InputPrompt({
			prompt: 'Enter the node Id:',
			autoShowKeyboard: true,
			isPassword: false,
			onSubmit: bind(this, 'onChangeId')
		});

		this._promptPosition = new InputPrompt({
			prompt: 'Enter x y positions (with space):',
			autoShowKeyboard: true,
			isPassword: false,
			onSubmit: bind(this, 'onChangePosition')
		});

		this._promptFriends = new InputPrompt({
			prompt: 'Enter x y r direction (with spaces):',
			autoShowKeyboard: true,
			isPassword: false,
			onSubmit: bind(this, 'onChangeFriends')
		});
	};

	this.onRight = function () {
		this.emit('Right');
	};

	this.onBottom = function () {
		this.emit('Bottom');
	};

	this.onRightTop = function () {
		this.emit('RightTop');
	};

	this.onRightBottom = function () {
		this.emit('RightBottom');
	};

	this.onNode = function () {
		this.emit('Node');
	};

	this.onTile = function () {
		this.emit('Tile');
	};

	this.onDoodad = function () {
		this.emit('Doodad');
	};

	this.onTags = function () {
		this.emit('Tags');
	};

	this.onRotate = function () {
		this.emit('Rotate');
	};

	this.onId = function () {
		this._prompt.show();
	};

	this.onChangeId = function (value) {
		value && this.emit('Id', value);
	};

	this.onPosition = function () {
		this._promptPosition.show();
	};

	this.onChangePosition = function (value) {
		value && this.emit('Position', value);
	};

	this.onFriends = function () {
		this._promptFriends.show();
	};

	this.onChangeFriends = function (value) {
		value && this.emit('Friends', value);
	};

	this.onText = function () {
		this.emit('Text');
	};

	this.onZoom = function () {
		this.emit('Zoom');
	};

	this.onClear = function () {
		if (window.confirm('Are you sure you want to clear this map?')) {
			this.emit('Clear');
		}
	};

	this.onExport = function () {
		this.emit('Export');
	};

	this.onClose = function () {
		this.emit('Close');
		this.hide();
	};
});
