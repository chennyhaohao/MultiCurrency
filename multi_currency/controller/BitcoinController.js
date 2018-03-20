var bitcore = require('bitcore-lib');
var explorers = require('bitcore-explorers');
var btcClient = require('bitcoin-core');
var Promise = require("bluebird");

var client = new btcClient({network: 'regtest', 'username': 'chen', 
	"password": "123", port: '18332'});
/*
client.getBalance('', 1).then(res => console.log(res));

client.getBalance('test', 1).then(res => console.log(res));

client.getAccountAddress('test').then(res => console.log(res));

client.move('', 'test', 1).then(res=>console.log(res));
*/
bitcore.Networks.enableRegtest();

var network = bitcore.Networks.testnet; //Change to livenet in production

class BitcoinController {

	get name() {
		return "BTC";
	}

	addressValid(address) {
		return bitcore.Address.isValid(address, network);
	}

	async generateAddress(id) {
		
		try {
			return (await client.getAccountAddress(id));
		} catch (e) {
			throw new Error(e);
		}
		
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
		try {
			return await client.getBalance(id, 6);
		} catch(e) {
			throw new Error(e);
		}
	}

	async unconfirmedBalance(id) {
		//Return the amount of balance that has not received 6 confirmations
		try {
			var confirmed = client.getBalance(id, 6);
			var unconfirmed = client.getBalance(id, 1);
			return (await unconfirmed) - (await confirmed);
		} catch(e) {
			throw new Error(e);
		}
	}

	async send(fromID, to, amount, gas, unit) {
		//Send currency		
		//TODO: consider unit & gas
		amount = parseFloat(amount.toFixed(8)); //Bitcoin maximum precision
		
		try {
			return await client.sendFrom(fromID, to, amount, 6);
		} catch (e) {
			throw new Error(e);
		}
	}

	async sendToAccount(fromID, to, amount, gas, unit) {
		//Send currency to account (sendFrom only takes address)
		//TODO: consider unit & gas
		amount = parseFloat(amount.toFixed(8)); //Bitcoin maximum precision
		
		try {
			var toAddress = await client.getAccountAddress(to);
			return await client.sendFrom(fromID, toAddress, amount, 6);
		} catch (e) {
			throw new Error(e);
		}

	}

	async safeSend(fromID, to, amount, gas, unit) {
		//Send currency		
		//TODO: consider unit & gas
		var err;
		if (!this.addressValid(to)) { //Validate toAddress
			throw new Error("Invalid address");
		}
		try {
			var gasFee = 0.000001;
			var balance = client.getBalance(fromID, 6);
			var numAddr = client.getAddressesByAccount(fromID);
			if ((await balance) < amount) {
				err = 'Insufficient funds';
				throw new Error(err);
			}
			numAddr = (await numAddr).length;
			//console.log("numAddr: ", numAddr);

			var gas = this.safeGasEstimate(gasFee, amount, numAddr);
			amount -= gas;
			amount = parseFloat(amount.toFixed(8)); //Bitcoin maximum precision
			console.log("Amount after fee: ", amount);
			if (amount <= 0) {
				err = 'Insufficient funds for transaction fee';
				throw new Error(err);
			}

			return await client.sendFrom(fromID, to, amount, 6);
		} catch (e) {
			throw new Error(e);
		}
	}

	async safeSendToAccount(fromID, to, amount, gas, unit) {
		//Send currency		
		//TODO: consider unit & gas
		try {
			var gasFee = 0.000001;
			var balance = client.getBalance(fromID, 6);
			var numAddr = client.getAddressesByAccount(fromID);
			if ((await balance) < amount) {
				var err = 'Insufficient funds';
				throw new Error(err);
			}
			var toAddress = client.getAccountAddress(to); // Wait until balance returns
			//to avoid overwhelming the rpc server
			numAddr = (await numAddr).length;
			//console.log("numAddr: ", numAddr);

			var gas = this.safeGasEstimate(gasFee, amount, numAddr);
			amount -= gas;
			amount = parseFloat(amount.toFixed(8)); //Bitcoin maximum precision

			console.log("Amount after fee: ", amount);

			if (amount <= 0) {
				var err = 'Insufficient funds for transaction fee';
				throw new Error(err);
			}
			
			return await client.sendFrom(fromID, (await toAddress), amount, 6);
		} catch (e) {
			throw new Error(e);
		}

	}


	async move(from, to, amount, unit) {
		var success;
		var err = null;

	}

	transactionConfirmed(from, to, amount, unit, txid) {
		//Bitcoin: use insight-api
		return true;
	}

	safeGasEstimate(gasFee, amount, numAddr) {
		//Safe maximum gas fee estimate
		//Concern: for small contributions (~20usd) we lose about 15-20% (0.0003/0.002)
		//There should be minimum contribution
		if (numAddr < 1) numAddr = 1;
		var nout = 2;
		var nin = 1;
		//Maximum transaction fee ~ 1%: as it'll rarely happen, cost negligible
		if (amount <= 0.07) { //<=500 usd
			nin = Math.min(numAddr, 2);
		} else if (amount > 0.07 && amount <= 0.3) { //500-2000 usd
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
		//console.log("nin: ", nin);

		return Math.min(gasFee*(nin*181 + nout*34 + 10)); //Fee-per-byte*size
	}
}

var controller = new BitcoinController();
/*
client.sendFrom('', "2NEzqZyPosKsm5tAjZvRh3g8MtEFB1WLifR", 
	100000, 6).then(res => console.log(res));
*/

module.exports = controller;