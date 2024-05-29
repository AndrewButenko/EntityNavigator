const rewire = require('rewire');
const defaults = rewire('react-scripts/scripts/build.js');
let config = defaults.__get__('config');
 
// Allow configuration for dev/non-dev based on command line parameter.
const isDev = process.argv.indexOf('-dev') !== -1;
if (isDev) {
	config.optimization.minimize = false;
	config.mode = "development";
}
config.optimization.splitChunks = {
	cacheGroups: {
		default: false
	}
};
 
config.optimization.runtimeChunk = false;
config.output.filename = '[name].js'
config.output.chunkFilename = '[name].chunk.js';
 
const minCssPlugin = config.plugins.find(x => x.constructor && x.constructor.name === 'MiniCssExtractPlugin');
minCssPlugin.options.filename = '[name].css'
minCssPlugin.options.moduleFilename = () => 'main.css'
 
config.module.rules.forEach(rule => {
	if (!Array.isArray(rule.oneOf))
		return;
	rule.oneOf.forEach(x => {
		if (x.options && x.options.name === 'static/media/[name].[hash:8].[ext]')
			x.options.name = '[name].[ext]';
	});
});