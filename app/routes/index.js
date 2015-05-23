var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' , blop: '<a href="#">Techolp</a>', OP: '4545'});
});

module.exports = router;
