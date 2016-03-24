// Build file for the Breakout Plugin. Creates the Plugin.xml file
// needed by Google Hangouts, and uses the `config.json` at the root
//of the project dir.

// Install `swig`, `fs`, and `concat-files` locally through NPM,
// and then run build.js.

var swig  = require('swig'),
    fs = require('fs'),
    concat = require('concat-files');

///////////////////////////////////
// Read Config File
var configFile = fs.readFileSync("../../config.json");
var configObj = JSON.parse(configFile);

// Generate index.html template
var template = swig.compileFile('./index.template');
var output = template({
    serverUrl: configObj.serverUrl,
});

fs.writeFile('index.tmp', output);

var header = fs.readFileSync('../header.xml');
var footer = fs.readFileSync('../footer.xml');

concat(['../header.xml', 'index.tmp', '../footer.xml'],
       '../plugin.xml',
       function() {
           fs.unlinkSync('index.tmp');
           console.log("Build finished, plugin created!");
       });


