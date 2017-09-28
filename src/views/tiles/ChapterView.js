import ui.ImageView as ImageView;

import ui.TextView as TextView;
import ui.ScoreView as ScoreView;

exports = Class(ImageView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._adventureMapView = opts.adventureMapView;
		this._chapterSettings = opts.chapterSettings;
		this._characterSettings = opts.chapterSettings.characterSettings || {};
		this._titleSettings = this._characterSettings.title;
		this._idSettings = this._characterSettings.id;

		this._titleText = new TextView(merge({
			superview: this,
		}, this._titleSettings));

		this._idText = new ScoreView(merge({
			superview: this
		}, this._idSettings));

		this.canHandleEvents(false);
	};

	this.update = function (grid, tileX, tileY) {
		var tile = grid[tileY][tileX];

		this._tileX = tileX;
		this._tileY = tileY;

		if (tile && tile.chapter) {
			if (this._chapterSettings.image) {
				this.setImage(this._chapterSettings.image);
			}

			if (tile.id && this._idSettings) {
				this._idText.updateOpts({
					visible: true
				});
				this._idText.setCharacterData(this._idSettings.characterData);
				this._idText.setText(tile.id);
			} else {
				this._idText.hide()
			}

			if (tile.id && this._titleSettings) {
				this._titleText.updateOpts({
					text: this._titleSettings.getText ?
						this._titleSettings.getText(tile.id) : 'CHAPTER',
					visible: true
				});
			} else {
				this._titleText.hide();
			}
		}

		this.style.visible = tile.chapter;
	};

	this.onReleaseChapter = function (grid, tileX, tileY) {
		this._titleText.hide();
		this._idText.hide();
	};
});
