var crawl = require('../crawl');

app.get('/library/casts', function(req, res) {
    db.getCasts(function(casts) {
        res.send(casts);
    });
});

app.post('/library/casts', function(req, res) {
    crawl(req.body.feedurl);
    res.send();
});

app.put('/library/casts/:id', function(req, res) {
    res.send();
});

app.delete('/library/casts/:id', function(req, res) {
    res.send();
});