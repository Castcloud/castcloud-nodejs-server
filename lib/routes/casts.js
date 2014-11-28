var express = require('express');
var crawl = require('../crawl');
var router = express.Router();

router.get('/', function(req, res) {
    req.db.getCasts(function(casts) {
        res.send(casts);
    });
});

router.post('/', function(req, res) {
    crawl(req.body.feedurl, function(cast) {
        req.db.addSubscription(cast.id);
        res.send(cast);
    });
});

router.put('/:id', function(req, res) {
	req.db.updateCast(req.params.id, { name: req.body.name });
    res.send();
});

router.delete('/:id', function(req, res) {
    res.send();
});

module.exports = router;