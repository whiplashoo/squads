var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

router.get('/create', function(req, res, next) {
  res.render('create', { title: 'Create' });
});

module.exports = router;
