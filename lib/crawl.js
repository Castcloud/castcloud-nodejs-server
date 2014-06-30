var request = require('request');
var xml2js = require('xml2js');
var md5 = require('MD5');

var parseXML = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true
}).parseString;

var cache = {};

module.exports = exports = crawl;
exports.all = crawlAll;
exports.urls = crawlUrls;

function crawl(url, done) {
    request(url, function(err, res, xml) {
        if (!err && res.statusCode == 200 && changed(url, xml)) {
            parseXML(xml, function(err, feed) {
                if (!err && isValidRSS(feed)) {
                    if (!(feed.rss.channel.item instanceof Array)) {
                        feed.rss.channel.item = [feed.rss.channel.item];
                    }

                    var cast = feed.rss.channel;
                    var episodes = cast.item;
                    delete cast.item;

                    app.db.saveCast({
                        url: url,
                        name: cast.title,
                        feed: cast
                    }, function(id) {
                        if (id) {
                            saveEpisodes(episodes, id);
                            done(id);
                        }
                        else {
                            app.db.getCastByURL(url, function(cast) {
                                saveEpisodes(episodes, cast.id);
                                done(cast.id);
                            });
                        }
                    });
                }
            });
        }
    });
}

function crawlAll() {
    app.db.getAllCasts(function(casts) {
        casts.forEach(function(cast) {
            crawl(cast.url);
        });
    });
}

function crawlUrls(urls) {
    urls.forEach(function(url) {
        crawl(url);
    });
}

function saveEpisodes(episodes, castid) {
    episodes.forEach(function(episode) {
        app.db.saveEpisode({
            castid: castid,
            lastevent: null,
            feed: episode
        });
    });
}

function isValidRSS(feed) {
    return feed.rss && feed.rss.channel.item;
}

function changed(url, xml) {
    if (url in cache) {
        var hash = md5(xml);
        if (cache[url].hash != hash) {
            cache[url].hash = hash;
            return true;
        }
        return false;
    }
    cache[url] = {
        hash: md5(xml)
    };
    return true;
}