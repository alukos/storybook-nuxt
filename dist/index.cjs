'use strict';

const vue3 = require('@storybook/vue3');



Object.keys(vue3).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = vue3[k];
});
