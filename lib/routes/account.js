var express = require('express');
var router = express.Router();

router.post('/login', function(req, res) {
	app.db.getUser(req.body.username, function(user) {
		if (user.password === req.body.password) {
			res.send({ token: user.auth[0].token });
		}
		else {
			res.sendStatus(400);
		}
	});
});

router.get('/ping', function(req, res) {
    res.send();
});

router.get('/settings', function(req, res) {
    res.send();
});

router.post('/settings', function(req, res) {
    res.send();
});

router.delete('/settings/:id', function(req, res) {
    res.send();
});

router.get('/takeout', function(req, res) {
    res.send();
});

module.exports = router;