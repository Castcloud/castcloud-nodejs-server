var express = require('express');
app = express();
var routes = require('./routes');

module.exports = exports = function(port) {
    app.listen(port || 80);
};