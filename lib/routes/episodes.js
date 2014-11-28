var express = require('express');
var router = express.Router();

router.get('/newepisodes', function(req, res) {
    req.db.getEpisodesSince(req.query.since, function(episodes) {
        res.send(episodes);
    });
});

router.get('/episodes/:castid', function(req, res) {
    req.db.getEpisodes(req.params.castid, function(episodes) {
        res.send(episodes);
    });
});

router.get('/episode/:id', function(req, res) {
    req.db.getEpisode(req.params.id, function(episode) {
        res.send(episode);
    });
});

router.get('/episodes/label/:label', function(req, res) {
    res.send();
});

module.exports = router;