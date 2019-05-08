var express = require('express');
var router = express.Router();

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

module.exports = router;
