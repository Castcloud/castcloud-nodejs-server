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

function crawl(url) {
    request(url, function(err, res, xml) {
        if (!err && res.statusCode == 200 && changed(url, xml)) {
            parseXML(xml, function(err, feed) {
                if (isValidRSS(feed)) {
                    if (!(feed.rss.channel.item instanceof Array)) {
                        feed.rss.channel.item = [feed.rss.channel.item];
                    }

                    var cast = feed.rss.channel;
                    var episodes = cast.item;
                    delete cast.item;

                    db.saveCast({
                        url: url,
                        name: cast.title,
                        feed: cast
                    });
                }
            });
        }
    });
}

function crawlAll() {
    db.getCasts(function(casts) {
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

function isValidRSS(feed) {
    return feed.rss && feed.rss.channel.item;
}

function changed(url, xml) {
    if (url in cache) {
        if (cache[url].hash != md5(xml)) {
            return true;
        }
        return false;
    }
    else {
        cache[url] = {
            hash: md5(xml)
        };
        return true;
    }
}