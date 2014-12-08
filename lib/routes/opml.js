var express = require('express');
var router = express.Router();

router.get('/casts.opml', function(req, res) {
	req.db.getCasts(function(casts) {
		res.set('Content-Type', 'text/xml');
		res.render('opml', { casts: casts, username: req.user.username });
	});
});

router.post('/casts.opml', function(req, res) {
    res.send();
});

module.exports = router;