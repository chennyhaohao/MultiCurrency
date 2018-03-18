var express = require('express');
var router = express.Router();
var controller = require('../controller/template.js');

router.get('/', function(req, res, next) {
	var result = controller.increment();
	res.send("done");
});

module.exports = router;
