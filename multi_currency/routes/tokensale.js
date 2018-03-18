var express = require('express');
var router = express.Router();
var controller = require('../controller/BitcoinController.js');
var Promise = require('bluebird');


router.get('/', function(req, res, next) {
	var result = controller.checkBalance('1', 'btc');
	console.log(result);
  	res.json(result);
});

router.get('/test', async function(req, res, next) {
	console.log("Test begins");
	console.log("Bitcoin tests");
	var result = {};
	var resultSend = {};
	var resultUnconf = {};
	console.log("Generate address");
	for (var i=0; i<10; i++) {
		var uname = 'user'+i.toString();
		result[uname] = controller.generateAddress(uname);
		//result[uname] = controller.balanceOf(uname);
	}
	//send test
	result = await Promise.props(result);
	console.log(result);

	console.log("Send to account");
	for (var i=0; i<10; i++) {
		var uname = 'user'+i.toString();
		resultSend[uname] = controller.sendToAccount('', uname, 0.5, 0, 'btc');
	}
	//resultSend.failure = controller.send('', result.user0.address , 10000, 0, 'btc');
	resultSend = await Promise.props(resultSend);
	console.log(resultSend);

	console.log("Unconfirmed balance");
	for (var i=0; i<10; i++) {
		var uname = 'user'+i.toString();
		resultUnconf[uname] = controller.unconfirmedBalance(uname);
	}
	resultUnconf = await Promise.props(resultUnconf);
	console.log(resultUnconf);

  	res.json(resultSend);
});

router.get('/generate-wallet/btc', async function(req, res, next) {
	var result = controller.generateWallet();
	console.log(result);
	//var result = await controller.checkBalance('1', 'btc');
	//console.log(result);

  	res.json(result);
});

module.exports = router;

