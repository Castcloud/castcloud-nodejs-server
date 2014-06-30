app.get('/library/newepisodes', function(req, res) {
    req.db.getEpisodesSince(req.query.since, function(episodes) {
        res.send(episodes);
    });
});

app.get('/library/episodes/:castid', function(req, res) {
    req.db.getEpisodes(req.params.castid, function(episodes) {
        res.send(episodes);
    });
});

app.get('/library/episode/:id', function(req, res) {
    req.db.getEpisode(req.params.id, function(episode) {
        res.send(episode);
    });
});

app.get('/library/episodes/label/:label', function(req, res) {
    res.send();
});