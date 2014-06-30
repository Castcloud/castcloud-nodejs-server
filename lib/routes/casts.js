var crawl = require('../crawl');

app.get('/library/casts', function(req, res) {
    req.db.getCasts(function(casts) {
        res.send(casts);
    });
});

app.post('/library/casts', function(req, res) {
    crawl(req.body.feedurl, function(id) {
        req.db.addSubscription(id);
    });
    res.send();
});

app.put('/library/casts/:id', function(req, res) {
    res.send();
});

app.delete('/library/casts/:id', function(req, res) {
    res.send();
});