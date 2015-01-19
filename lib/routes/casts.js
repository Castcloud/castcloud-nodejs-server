var express = require('express');
var crawl = require('../crawl');
var router = express.Router();

router.get('/', function(req, res) {
    req.db.getCasts(function(casts) {
        res.send(casts);
    });
});

router.post('/', function(req, res) {
	req.db.getCastByURL(req.body.feedurl, function(cast) {
		if (cast) {
			req.db.addSubscription(cast.id);
			res.send(cast);
		}
		else {
			crawl(req.body.feedurl, { 
		    	done: function(cast) {
			        req.db.addSubscription(cast.id);
			        res.send(cast);
			    } 
			});
		}
	});    
});

router.put('/:id', function(req, res) {
	req.db.updateCast(req.params.id, { name: req.body.name });
    res.send();
});

router.delete('/:id', function(req, res) {
	req.db.removeSubscription(req.params.id);
    res.send();
});

module.exports = router;