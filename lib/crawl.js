var request = require('request');
var xml2js = require('xml2js');

var parseXML = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true
}).parseString;

module.exports = exports = crawl;
exports.all = crawlAll;
exports.urls = crawlUrls;

function crawl(url) {
    request(url, function(err, res, xml) {
        if (!err && res.statusCode == 200) {
            parseXML(xml, function(err, feed) {
                if (isValidRSS(feed)) {
                    if (!(feed.rss.channel.item instanceof Array)) {
                        feed.rss.channel.item = [feed.rss.channel.item];
                    }

                    var cast = feed.rss.channel;
                    var episodes = cast.item;
                    delete cast.item;

                    console.log(episodes);
                }
            });
        }
    });
}

function crawlAll() {

}

function crawlUrls(urls) {
    urls.forEach(function(url) {
        crawl(url);
    });
}

function isValidRSS(feed) {
    return feed.rss && feed.rss.channel.item;
}