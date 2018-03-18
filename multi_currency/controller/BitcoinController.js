var bitcore = require('bitcore-lib');
var explorers = require('bitcore-explorers');
var btcClient = require('bitcoin-core');
var Promise = require("bluebird");

var client = new btcClient({network: 'regtest', 'username': 'chen', 
	"password": "123", port: '18332'});

client.getBalance('', 1).then(res => console.log(res));

client.getBalance('test', 1).then(res => console.log(res));

client.getAccountAddress('test').then(res => console.log(res));

client.move('', 'test', 1).then(res=>console.log(res));

bitcore.Networks.enableRegtest();

var network = bitcore.Networks.testnet; //Change to livenet in production

class BitcoinController {

	get name() {
		return "BTC";
	}

	walletValid(wallet) {
		return bitcore.Address.isValid(address, network);
	}

	async generateAddress(id) {
		var success = true;
		var err = null;
		var addr;
		try {
			addr = await client.getAccountAddress(id);
		} catch (e) {
			success = false;
			addr = '';
			err = e;
		}
		return {success: success, error: err, address: addr};
		/*
		var privateKey = new bitcore.PrivateKey();
		var address = privateKey.toAddress(network);
		
		for (var key in address) {
			console.log(key);
		}
		console.log(address.toObject());
		
		console.log(address);
		console.log("valid: "+bitcore.Address.isValid(address, network));
		return {success: true, wallet: address.toString(), 
			privateKey: privateKey, error: null};
		*/
	}

	async balanceOf(id) {
		var success = true;
		var err = null;
		var balance;
		try {
			balance = await client.getBalance(id, 6);
		} catch(e) {
			success = false;
			balance = 0;
			err = e;
		}

		return {success: success, balance: balance, unit: 'btc', error: err};
	}

	async unconfirmedBalance(id) {
		//Return the amount of balance that has not received 6 confirmations
		var success = true;
		var err = null;
		var balance;
		try {
			var confirmed = client.getBalance(id, 6);
			var unconfirmed = client.getBalance(id, 0);
			balance = (await unconfirmed) - (await confirmed);
		} catch(e) {
			success = false;
			balance = 0;
			err = e;
		}

		return {success: success, balance: balance, unit: 'btc', error: err};
	}

	async send(fromID, to, amount, gas, unit) {
		//Send currency		
		//TODO: consider unit & gas
		var success = true;
		var txid;
		var err = null;
		try {
			txid = await client.sendFrom(fromID, to, amount, 6);
		} catch (e) {
			success = false;
			txid = '';
			err = e;
		}

		return {success: success, txid: txid, error: err};
	}

	async sendToAccount(fromID, to, amount, gas, unit) {
		//Send currency to account (sendFrom only takes address)
		//TODO: consider unit & gas
		var success = true;
		var txid;
		var err = null;
		try {
			var toAddress = await client.getAccountAddress(to);
			txid = await client.sendFrom(fromID, toAddress, amount, 6);
		} catch (e) {
			success = false;
			txid = '';
			err = e;
		}

		return {success: success, txid: txid, error: err};
	}

	async safeSend(fromID, to, amount, gas, unit) {
		//Send currency		
		//TODO: consider unit & gas
		var success = true;
		var txid;
		var err = null;
		try {
			txid = await client.sendFrom(fromID, to, amount, 6);
		} catch (e) {
			success = false;
			txid = '';
			err = e;
		}

		return {success: success, txid: txid, error: err};
	}

	async move(from, to, amount, unit) {
		var success;
		var err = null;

	}

	transactionConfirmed(from, to, amount, unit, txid) {
		//Bitcoin: use insight-api
		return true;
	}

	gasEstimate(gasFee, amount, numAddr) {
		//Safe maximum gas fee estimate
		if (numAddr < 1) numAddr = 1;
		var nout = 2;
		var nin = 1;
		//Maximum transaction fee ~ 1%: as it'll rarely happen, cost negligible
		if (amount > 0.07 && amount <= 0.3) { //500-2000 usd
			nin = Math.min(numAddr, 5);
		} else if (amount > 0.3 && amount <= 0.7) { //2000-5000 usd
			nin = Math.min(numAddr, 10);
		} else if (amount > 0.7 && amount <= 1.4) { //5000-10000 usd
			nin = Math.min(numAddr, 25);
		} else if (amount > 1.4 && amount <= 14) { //10000-100000
			nin = Math.min(numAddr, 50);
		} else { //>100000
			nin = Math.min(numAddr, 125);
		}

		return gasFee*(nin*181 + nout*34 + 10); //Fee-per-byte*size
	}
}

var controller = new BitcoinController();
/*
client.sendFrom('', "2NEzqZyPosKsm5tAjZvRh3g8MtEFB1WLifR", 
	100000, 6).then(res => console.log(res));
*/

module.exports = controller;