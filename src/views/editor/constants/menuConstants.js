import lib.Enum as Enum;

var constants = {};

constants.BOX_SLICES = {
	SOURCE_SLICES: {
		horizontal: {left: 30, center: 10, right: 30},
		vertical: {top: 30, middle: 10, bottom: 30}
	},
	DEST_SLICES: undefined
};

constants.BUTTON_SLICES = {
	SOURCE_SLICES: {
		horizontal: {left: 30, center: 10, right: 30},
		vertical: {top: 30, middle: 10, bottom: 30}
	},
	DEST_SLICES: undefined
};

constants.BUTTONS = {
	BLUE: {
		UP: 'resources/images/ui/button1Up.png',
		DOWN: 'resources/images/ui/button1Down.png',
		FONT_FAMILY: 'BPReplay',
		FONT_SIZE: 36,
		COLOR: 'rgb(255, 255, 255)',
		STROKE_COLOR: 'rgb(73, 154, 203)',
		STROKE_WIDTH: 6
	},
	GREEN: {
		UP: 'resources/images/ui/button2Up.png',
		DOWN: 'resources/images/ui/button2Down.png',
		FONT_FAMILY: 'BPReplay',
		FONT_SIZE: 36,
		COLOR: 'rgb(255, 255, 255)',
		STROKE_COLOR: 'rgb(15, 111, 55)',
		STROKE_WIDTH: 6
	},
	RED: {
		UP: 'resources/images/ui/button3Up.png',
		DOWN: 'resources/images/ui/button3Down.png',
		FONT_FAMILY: 'BPReplay',
		FONT_SIZE: 36,
		COLOR: 'rgb(255, 255, 255)',
		STROKE_COLOR: 'rgb(111, 15, 55)',
		STROKE_WIDTH: 6
	}
};

function setConstants (c) {
	exports = merge(c, exports);
	exports.set = setConstants;
}

setConstants(constants);
