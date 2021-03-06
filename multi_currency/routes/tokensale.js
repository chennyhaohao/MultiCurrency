var express = require('express');
var router = express.Router();
var btcController = require('../controller/BitcoinController.js');
var controller = require('../controller/MasterController.js');
var Auth = require('./Authentication.js');
var Promise = require('bluebird');


router.get('/', Auth.ensureAuthorized, function(req, res, next) {
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
	console.log("Get balance");
	for (var i=0; i<10; i++) {
		var uname = 'user'+i.toString();
		//result[uname] = controller.generateAddress(uname);
		result[uname] = controller.balanceOf(uname);
	}

	//send test
	result = await Promise.props(result);
	console.log(result);

	console.log("Safe send");
	for (var i=0; i<10; i++) {
		var uname = 'user'+i.toString();
		resultSend[uname] = controller.safeSendToAccount(uname,'',result[uname].balance, 
			0, 'btc');
	}
	/*result.user1 = controller.safeSend('', result.user1.address, 0.5, 
			0, 'btc');*/
	resultSend.failure = controller.safeSendToAccount('test3', 'test', 1, 
		0, 'btc');
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

router.get('/generate-wallet/:currency', Auth.ensureAuthorized,
	 async function(req, res, next) {
		//var userid = req.user.id.toString(); //get user id from request auth token
		var result = await controller.generateWallet(req.user, 
			req.params.currency);
		//console.log(result);
		if (result.error) {
			result.error = result.error.message; //res.json() cannot retain methods
		}
	  	res.json(result);
	}
);

router.get('/get-wallet/:currency', Auth.ensureAuthorized,
	 async function(req, res, next) {
		//var userid = req.user.id.toString(); //get user id from request auth token
		var result = await controller.getWallet(req.user, 
			req.params.currency);
		//console.log(result);
		if (result.error) {
			result.error = result.error.message; //res.json() cannot retain methods
		}
	  	res.json(result);
	}
);

router.get('/balance/:currency', Auth.ensureAuthorized,
	async function(req, res, next) {
		//var userid = req.user.id.toString(); //get user id from request auth token
		var result = await controller.balanceOf(req.user, 
			req.params.currency);
		if (result.error) {
			result.error = result.error.message; //res.json() cannot retain methods
		}
		return res.json(result);
	}
);

router.get('/tokenbalance/:address', Auth.ensureAuthorized,
	async function(req, res, next) {
		var address = req.params.address;
		var result = await controller.tokenBalance(address);
		if (result.error) {
			result.error = result.error.message; //res.json() cannot retain methods
		}
		return res.json(result);
	}
);

router.post('/contribute/:currency', 
	Auth.ensureAuthorized,
	async function(req, res, next) {
		//var userid = req.user.id.toString(); //get user id from request auth token
		var amount = req.body.amount;
		var toWallet = req.body.ethWallet;
		var result = await controller.buyToken(req.user, parseFloat(amount),
			toWallet, req.params.currency);
		console.log(result);
		if (result.error) {
			result.error = result.error.message; //res.json() cannot retain methods
		}
		return res.json(result);
	}
);

router.post('/withdraw/:currency', Auth.ensureAuthorized,
	async function(req, res, next) {
		//var userid = req.user.id.toString(); //get user id from request auth token
		var amount = req.body.amount;
		var toAddress = req.body.withdrawAddress;
		var result = await controller.withdraw(req.user, amount, toAddress, 
			req.params.currency);
		console.log(result);
		if (result.error) {
			result.error = result.error.message; //res.json() cannot retain methods
		}
		return res.json(result);
	}
);

module.exports = router;

