var express = require('express');
var bodyParser = require('body-parser');
var Storage = require('./storage/mongo');
var adapter = require('./storage/nedbAdapter');
var db = new Storage(adapter);
var crawl = require('./crawl');

db.saveUser({
    username: 'user',
    auth: [{
        token: 'lol'
    }]
});

app = express();
app.db = db;

app.use(bodyParser());
app.use(function(req, res, next) {
    db.getUserByToken(req.headers.authorization, function(user) {
        if (user) {
            req.db = new Storage(adapter, user);
            req.user = user;
            next();
        }
        else {
            res.send(400);
        }
    });
});

require('./routes');

module.exports = exports = run;

function run(port) {
    keepCrawling();
    app.listen(port || 80);
}

function keepCrawling() {
    crawl.all();
    setTimeout(keepCrawling, 60000);
}