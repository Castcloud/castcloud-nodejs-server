var util = require('util');
var EventEmitter = require('events').EventEmitter;
var expat = require('node-expat');
var request = require('request');
var _ = require('lodash');
var app = require('./app');

function crawl(url, data) {
    data = data || {};
    data.url = url;

    request(url, function() {}).pipe(crawl.parser(data));
}

crawl.parser = function(data) {
    var parser = new expat.Parser('UTF-8');

    var obj = {};
    var currentNode = obj;
    var currentName = null;
    var stack = [];

    var channel = false;

    parser.on('startElement', function(name, attrs) {
        if (!channel && name === 'item' && obj.rss) {
            channel = true;
            delete obj.rss.channel._;
            crawl.emit('channel', obj.rss.channel, data);
        }

        currentName = name;

        if (!(name in currentNode)) {
            currentNode[name] = attrs;
        }
        else if (!(currentNode[name] instanceof Array)) {
            var arr = [currentNode[name]];
            arr.push(attrs);
            currentNode[name] = arr;
        }
        else {
            currentNode[name].push(attrs);
        }

        stack.push(currentNode);

        if (currentNode[name] instanceof Array) {
            currentNode = currentNode[name][currentNode[name].length - 1];
        }
        else {
            currentNode = currentNode[name];
        }
    });

    parser.on('endElement', function(name) {
        if (currentName !== name) {
            delete currentNode._;
        }

        if (name === 'item') {
            crawl.emit('item', currentNode, data);
        }
        else if (name === 'outline') {
            crawl.emit('outline', currentNode, data);
        }
        else if (name === 'rss') {
            crawl.emit('done', obj, data);
        }

        currentNode = stack.pop();

        if (_.size(currentNode[name]) === 1 && currentNode[name]._) {
            currentNode[name] = currentNode[name]._;
        }
    });

    parser.on('text', function(text) {
        currentNode._ = (currentNode._ || '') + text;
    });

    return parser;
};

crawl.all = function() {
    app.db.getAllCasts(function(casts) {
        _.each(casts, function(cast) {
            crawl(cast.url);
        });
    });
};

crawl.urls = function(urls, data) {
    _.each(urls, function(url) {
        crawl(url, data);
    });
};

_.extend(crawl, EventEmitter.prototype);

crawl.on('channel', function(cast, data) {
    data.insertCast = app.db.saveCast({
        url: data.url,
        name: cast.title,
        feed: cast
    });
});

crawl.on('item', function(episode, data) {
    if (episode.guid) {
        episode.guid = episode.guid._ || episode.guid;
    }
    else {
        episode.guid = enclosure.url;
    }

    data.insertCast.success(function(cast) {
        app.db.saveEpisode({
            castid: cast._id,
            lastevent: null,
            feed: episode,
            crawlts: Date.now() / 1000 | 0
        });
    });
});

crawl.on('done', function(feed, data) {
    data.insertCast.success(function(cast) {
        cast.id = cast._id;
        delete cast._id;
        data.done && data.done(cast);
    });
});

crawl.on('outline', function(outline, data) {

});

module.exports = crawl;
