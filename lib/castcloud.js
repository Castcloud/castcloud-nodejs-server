var _ = require('lodash');
var bcrypt = require('bcrypt');
var app = require('./app');
var crawl = require('./crawl');
var DB = require('./db');

var defaults = {
    port: 3000,
    crawl_interval: 5 * 60000
};

function run(opts) {
    opts = opts || {};
    _.defaults(opts, defaults);

    initDB();

    keepCrawling(opts.crawl_interval);

    app.listen(opts.port);
    console.log('Listening on port ' + opts.port);
}

function initDB() {
    app.db = new DB();

    bcrypt.genSalt(function(err, salt) {
        bcrypt.hash('pass', salt, function(err, hash) {
            app.db.saveUser({
                username: 'user',
                password: hash,
                clients: [{
                    token: 'lol',
                    uuid: 'unique',
                    clientname: 'Castcloud'
                }],
                subscriptions: []
            });
        });
    });
}

function keepCrawling(interval) {
    crawl.all();
    setTimeout(keepCrawling, interval);
}

module.exports = run;