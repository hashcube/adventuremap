import math.geom.Vec2D as Vec2D;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;

exports = Class(ImageView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._path = opts.tileSettings.directory;
	};

	this.update = function (grid, tileX, tileY) {
		this._tileX = tileX;
		this._tileY = tileY;

		if (typeof(this._path) === 'function') {
			this.setImage(this._path(tileX, tileY));
		} else {
			this.setImage(this._path + '/' + tileY + '_' + tileX + '.png');
		}
	};

	this.onInputSelect = function () {
		this._superview.emit('Select', this._tileX, this._tileY);
	};
});
