import .ButtonView as ButtonView;

import ..constants.menuConstants as menuConstants;

exports = Class(ButtonView, function(supr) {
	this.init = function(opts) {
		opts = merge(
			opts,
			{
				on: {
					up: bind(this, 'emit', 'Up')
				}
			}
		);

		supr(this, 'init', [opts]);

		this._text.updateOpts({size: 26});
	};
});
