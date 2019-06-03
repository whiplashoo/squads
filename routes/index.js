var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

router.get('/create', function(req, res, next) {
  res.render('create', { title: 'Create' });
});

router.get('/feedback', function(req, res, next) {
  res.render('feedback', { title: 'Feedback' });
});

router.get('/ads.txt', function(req, res, next) {
  res.sendFile("ads.txt", {root: "public"});
});


module.exports = router;
