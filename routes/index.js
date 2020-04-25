var express = require('express');
var router = express.Router();
var path = require('path');
var Player = require('../models/player');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home | Create Formation' });
});

router.get('/create', function(req, res, next) {
  res.render('create', { title: 'Create | Create Formation' });
});

router.get('/feedback', function(req, res, next) {
  res.render('feedback', { title: 'Feedback | Create Formation' });
});

router.get('/legends-list', function(req, res, next) {
	var query = Player.find({ club: "LEGEND" }).sort({rating: -1});
    // Execute query in a callback and return players list
    query.exec(function(err, players) {
        if (!err) {
            // Construct the json result set
            var result = [];
            for (var i = 0; i < players.length; i++) {
                var p = players[i];
                result.push({
                    'id': i,
                    'text': p.name,
                    'pos': p.pos,
                });
            }
            res.render('legends-list', { title: 'Legends List | Create Formation', result: result });
        } else {
            res.send(JSON.stringify(err), {
                'Content-Type': 'application/json'
            }, 404);
        }
    });
  	
});




module.exports = router;
