var express = require('express');
var bodyParser = require('body-parser');
var crawl = require('./crawl');

app = express();

app.use(bodyParser());

require('./routes');

module.exports = exports = run;

function run(port) {
    keepCrawling();
    app.listen(port || 80);
}

function keepCrawling() {
    crawl.all();
    setTimeout(keepCrawling, 30000);
}