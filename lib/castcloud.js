var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var _ = require('lodash');
var crawl = require('./crawl');
var MongoStore = require('./storage/MongoStore');
var adapter;

var defaults = {
    port: 3000,
    db: 'nedb'
};

app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
    if (req.path !== '/account/login') {
        app.db.getUserByToken(req.headers.authorization, function(user) {
            if (user) {
                req.db = new MongoStore(adapter, user);
                req.user = user;
                next();
            }
            else {
                res.sendStatus(400);
            }
        });
    }
    else {
        next();
    }
});

app.use('/account', require('./routes/account'));
app.use('/library/casts', require('./routes/casts'));
app.use('/library', require('./routes/episodes'));
app.use('/library/events', require('./routes/events'));
app.use('/library/labels', require('./routes/labels'));
app.use('/library', require('./routes/opml'));

function run(opts) {
    _.defaults(opts, defaults);

    switch(opts.db) {
        case 'mongodb':
            adapter = require('./storage/mongoAdapter');
            break;

        case 'nedb':
            adapter = require('./storage/nedbAdapter');
            break;
    }
    app.db = new MongoStore(adapter);

    app.db.saveUser({
        username: 'user',
        password: 'pass',
        auth: [{
            token: 'lol'
        }]
    });

    keepCrawling();

    app.listen(opts.port);
    console.log('Listening on port ' + opts.port + '...');
}

function keepCrawling() {
    crawl.all();
    setTimeout(keepCrawling, 60000);
}

module.exports = run;