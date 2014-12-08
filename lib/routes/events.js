var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	var since = req.query.since;
	var exclude_self = req.query.exclude_self === 'true';

	req.db.getEvents(since, exclude_self, function(events) {
		res.send(events);
	});
});

router.post('/', function(req, res) {
	req.db.addEvents(JSON.parse(req.body.json));
    res.send();
});

module.exports = router;