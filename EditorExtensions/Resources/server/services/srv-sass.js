//#region Imports
var sass = require("node-sass"),
    path = require("path");
//#endregion

//#region Handler
var handleSass = function (writer, params) {
    var mapFileName = params.targetFileName + ".map";
    var sourceMapURL = params.sourceMapURL != undefined ? "map" : "none";
    sass.render({
        file: params.sourceFileName,
        includePaths: [path.dirname(params.sourceFileName)],
        precision: parseInt(params.precision, 10),
        outputStyle: params.outputStyle,
        sourceComments: sourceMapURL,
        sourceMap: mapFileName,
        success: function (css, map) {
            map = JSON.parse(map);
            map.file = path.basename(params.targetFileName);
            if (params.autoprefixer != undefined) {
                var autoprefixedOutput = require("./srv-autoprefixer").processAutoprefixer(css, map, params.autoprefixerBrowsers, params.sourceFileName, params.targetFileName);
                css = autoprefixedOutput.css;
                // Curate the sources returned by autoprefix; remove ../ from the start of each source
                var newMaps = JSON.parse(autoprefixedOutput.map);
                newMaps.sources = newMaps.sources.map(function (source) {
                    return source.substr(3, source.length);
                });
                map = newMaps;
            }

            writer.write(JSON.stringify({
                Success: true,
                Remarks: "Successful!",
                Output: {
                    outputContent: css,
                    mapContent: map
                }
            }));
            writer.end();
        },
        error: function (error) {
            writer.write(JSON.stringify({ Success: false, Remarks: error }));
            writer.end();
        }
    });
};
//#endregion

//#region Exports
module.exports = handleSass;
//#endregion
