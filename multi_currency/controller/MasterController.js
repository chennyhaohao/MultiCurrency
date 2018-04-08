var btcController = require('./BitcoinController.js');
var tokenController = require('./TokenController.js');
var ethController = require('./EthController.js');

function sleep(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	});
}

function selectController(currency) {
	if (currency == 'btc') {
		return btcController;
	} else if (currency == 'eth') {
		return ethController;
	} else {
		throw new Error("Invalid currency");
	}
}

class TokenSaleController { //Core operations
	

	async generateWallet(user, currency) {
		/*Create wallet address in `currency` for `id`,
		 which receives contributions*/
		//Check id exists
		//Check if there's already wallet; if so report err
		//Generate wallet
		//Store in database in id's row (private key should be well encrypted)
		//Encryption (e.g. with AES): 
		//Encrypt(hash(masterkey, salt+pepper, userID+pass), privatek)
		//Masterkey & pepper should be input manually at server start
		//User need to re-enter pass/go through email confirmation
		var success = true;
		var addr, controller;
		var err = null;

		try {
			controller = selectController(currency);
			addr = await controller.generateAddress(user);
		} catch(e) {
			success = false;
			err = e;
			addr = '';
		}

		return {success: success, address: addr, error: err};
	}

	async getWallet(user, currency) {
		
		var success = true;
		var addr, controller;
		var err = null;

		try {
			controller = selectController(currency);
			addr = await controller.getAddress(user);
		} catch(e) {
			success = false;
			err = e;
			addr = '';
		}

		return {success: success, address: addr, error: err};
	}



	async balanceOf(user, currency) {
		/*Check `id`s balance of `currency`*/
		//Check if id & wallet exists
		//Query balance from api
		var success = true;
		var balance, controller;
		var err = null;
		var unit = currency;
		
		try {
			controller = selectController(currency);
			balance = await controller.balanceOf(user);
		} catch(e) {
			success = false;
			err = e;
			balance = 0;
		}

		return {success: success, balance: balance, unit: unit, error: err};
	}

	async tokenBalance(address) {
		var success = true;
		var balance;
		var unit = "token"
		var err = null;
		try {
			balance = await tokenController.balanceOf(address); //Unit already converted
		} catch(e) {
			success = false;
			err = e;
			balance = 0;
		}
		return {success: success, balance: balance, unit: unit, error: err};
	}

	async buyToken(user, amount, toWallet, currency) {
		/*Buy `amount` tokens into `ethWallet` with `currency`*/
		//Check id & wallet exists
		//Check wallet validity?
		//Check KYC limit
		//"Reserve" tokens to avoid failing to issue after 1 hour of wait
		//Calculate amount of currency to be deducted
		//Get id's wallet, check balance and transfer the currency out
		//(Needs to actually transfer; using db may lead to critical section problem)
		//Add to db as unresolved contribution
		//Wait until succeeds and issue tokens
		//If times out, update database and use manual resolution
		//If token issue failed, send back currency
		//TODO: gas problem
		var success = true;
		var err = null;
		var btc_txid, txid;
		var xrate = 10;
		var btcAmount = amount/xrate;
		try {
			//TODO: check user kyc token limit
			var balance = await btcController.balanceOf(user);
			if (balance < btcAmount) { //Check balance
				return {success: false, txid:'', error: new Error("Insufficient funds")};
			}

			await tokenController.reserve(toWallet, amount); 
			try {
				btc_txid = await btcController.safeSendToAccount(user, 'multisig', btcAmount,
					0, 'btc');
			} catch(e) { //If fails, cancel reservation
				await tokenController.cancelRsvp(toWallet, amount);
				return {success: false, txid: '', error: e};
			}
			//Else issue tokens
			txid = await tokenController.issueToken(toWallet, amount, true);
			//TODO: update user purchased amount
		} catch(e) {
			console.log(e);
			success = false;
			err = e;
			txid = '';
		}
	}

	async testBuyToken(user, amount, toWallet, currency) {
		//Simulate the blockchain delay!


		var delay = 1500; //1500 ms = 1.5 sec

		var success = true;
		var err = null;
		var btc_txid, txid;
		var xrate = 10;
		var btcAmount = amount/xrate;
		try {
			var balance = await btcController.balanceOf(user);
			if (balance < btcAmount) { //Check balance
				return {success: false, txid:'', error: new Error("Insufficient funds")};
			}

			await tokenController.reserve(toWallet, amount); 
			await sleep(delay);
			try {
				btc_txid = await btcController.safeSendToAccount(user, 'multisig', btcAmount,
					0, 'btc');
			} catch(e) { //If fails, cancel reservation
				await tokenController.cancelRsvp(toWallet, amount);
				return {success: false, txid: '', error: e};
			}
			//Else issue tokens
			txid = await tokenController.issueToken(toWallet, amount, true);
			await sleep(delay);
		} catch(e) {
			console.log(e);
			success = false;
			err = e;
			txid = '';
		}

		return {success: success, txid: txid, error: err};
	}

	async withdraw(user, amount, toAddress, currency) {
		/*Withdraw `amount` `currency` into `wallet`*/
		//Check id & wallet exists
		//Check wallet validity?
		//Get id's wallet and transfer the currency out
		//TODO: think about race condition (probly not)
		//TODO: gas problem
		var success = true;
		var txid;
		var err = null;
		
		try {
			controller = selectController(currency);
			txid = await controller.safeSend(user, toAddress, amount, 0, 'btc');
		} catch(e) {
			success = false;
			txid = '';
			err = e;
		}

		return {success: success, txid: txid, error: err};
	}

}

var controller = new TokenSaleController();

module.exports = controller;