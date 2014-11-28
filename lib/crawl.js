var request = require('request');
var xml2js = require('xml2js');
var md5 = require('MD5');
var _ = require('lodash');

var parseXML = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true
}).parseString;

var cache = {};

function crawl(url, done) {
    done = done || function() {};
    request(url, function(err, res, xml) {
        if (!err && res.statusCode === 200 && changed(url, xml)) {
            parseXML(xml, function(err, feed) {
                if (!err && isValidRSS(feed)) {
                    if (!(feed.rss.channel.item instanceof Array)) {
                        feed.rss.channel.item = [feed.rss.channel.item];
                    }

                    var castFeed = feed.rss.channel;
                    var episodes = castFeed.item;
                    delete castFeed.item;

                    var cast = {
                        url: url,
                        name: castFeed.title,
                        feed: castFeed
                    };

                    app.db.saveCast(cast, function(id) {
                        if (id) {
                            saveEpisodes(episodes, id);
                            cast.id = id;
                            done(cast);
                        }
                        else {
                            app.db.getCastByURL(url, function(cast) {
                                saveEpisodes(episodes, cast.id);
                                done(cast);
                            });
                        }
                    });
                }
            });
        }
        else {
            app.db.getCastByURL(url, function(cast) {
                done(cast);
            });
        }
    });
}

crawl.all = function() {
    app.db.getAllCasts(function(casts) {
        casts.forEach(function(cast) {
            crawl(cast.url);
        });
    });
}

crawl.urls = function(urls) {
    urls.forEach(function(url) {
        crawl(url);
    });
}

function saveEpisodes(episodes, castid) {
    var time = new Date() / 1000 | 0;
    app.db.getEpisodes(castid, function(oldEpisodes) {
        episodes.forEach(function(episode) {
            var episodeExists = _.where(oldEpisodes, { feed: { guid: episode.guid } }).length > 0;
            if (!episodeExists) {
                app.db.saveEpisode({
                    castid: castid,
                    lastevent: null,
                    feed: episode,
                    crawlts: time
                });
            }
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

module.exports = crawl;