module.exports = function (api) {
    const env = api.env();
    if (env == null) { throw new Exception("missing <env>"); }
    const defines = { gEnvironment: env };
    return {
	"presets": ["@babel/preset-env"],
	"plugins": [ ["transform-define", defines] ],
	"assumptions": { "noDocumentAll": true }
    };	
}



