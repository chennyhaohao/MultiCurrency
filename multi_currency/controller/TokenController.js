var Web3 = require('web3');
var contract = require('truffle-contract');
var artifacts_path = './build/contracts/';
var DemoToken_artifacts = require(artifacts_path + 'DemoToken.json');
var Crowdsale_artifacts = require(artifacts_path + 'Crowdsale.json');
var web3;

/*if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {*/
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  //web3.setProvider();
//}
  //web3 = new Web3(web3.currentProvider);
var coinbase;
//console.log("Balance: ", web3.eth.getBalance('0x96d9b127c3fce317fba175c6390c173d009ba580'));
//console.log("Connected: ", web3.isConnected());

function web3versionFix(abstract) {
	//Fix truffle compatibility issue with web3 v1.0.0
	if (typeof abstract.currentProvider.sendAsync !== "function") {
			console.log("Fixing");
		  abstract.currentProvider.sendAsync = function() {
		    return abstract.currentProvider.send.apply(
		      abstract.currentProvider, arguments
		    );
		};
	}
}

class TokenController {

	constructor(account) {
		this.DemoToken = contract(DemoToken_artifacts);
		this.Crowdsale = contract(Crowdsale_artifacts);
		this.DemoToken.setProvider(web3.currentProvider);
		this.Crowdsale.setProvider(web3.currentProvider);
		web3versionFix(this.DemoToken);
		web3versionFix(this.Crowdsale);
		this.tokenAddress = '';
		this.crowdsaleAddress = '';
		this.account = account;
		console.log("TokenController initialized");
	}

	setAccount(acc) {
		this.account = acc;
	}

	async deployToken() {
		try {
			console.log("Deploying token...");
			var instance = await this.DemoToken.new({from: this.account, 
	            gas: 4000000});
			console.log("Token deployed at: ", instance.address);
			this.tokenAddress = instance.address;
	        return instance.address;
    	} catch (e) {
    		console.log(e);
    		throw new Error(e);
    	}
	}

	async deployCrowdsale() {
		try {
			console.log("Deploying crowdsale...");
			var instance = await this.Crowdsale.new(this.tokenAddress,
				{from: this.account, gas: 4000000});
			console.log("Crowdsale deployed at: ", instance.address);
			this.crowdsaleAddress = instance.address;
	        return instance.address;
		} catch (e) {
    		console.log(e);
    		throw new Error(e);
    	}
	}

	async setMaxCap(maxCap) {
		try {
			var value = web3.utils.toWei(maxCap.toString(), "ether"); //Unit translation
	        var crowdsaleInstance = await this.Crowdsale.at(this.crowdsaleAddress);
	        var result = await crowdsaleInstance.setMaxCap(value, {
	            from: this.account
	        });
	        console.log(result);
	        return result.tx;
		} catch(e) {
			//console.log(e);
			throw new Error(e);
		}
	}

	async setFunder(funder) {
		if (!web3.utils.isAddress(funder)) { //Validate funder address
			throw new Error("Invalid address", funder);
		}
		try {
			var [crowdsaleInstance, tokenInstance] = await Promise.all([
					this.Crowdsale.at(this.crowdsaleAddress),
					this.DemoToken.at(this.tokenAddress)
				]); //Getting instances
			await tokenInstance.approve(this.crowdsaleAddress, 
				web3.utils.toWei('1000', "ether"), {
	            from: this.account
	        }); //funder approve crowdsale contract
	        var result = await crowdsaleInstance.setFunder(funder, {
	            from: this.account
	        });
	        console.log(result);
	        return result.tx;
		} catch(e) {
			//console.log(e);
			throw new Error(e);
		}
	}

	async issueToken(to, amount, reserved) {
		if (!web3.utils.isAddress(to)) { //Validate toAddress
			throw new Error("Invalid address");
		}
		try {
			var value = web3.utils.toWei(amount.toString(), "ether"); //Unit translation
	        var crowdsaleInstance = await this.Crowdsale.at(this.crowdsaleAddress);
	        var result = await crowdsaleInstance.issue(to, value, reserved, {
	            from: this.account
	        });
	        console.log(result);
	        return result.tx;
		} catch(e) {
			//console.log(e);
			throw new Error(e);
		}
	}

	async reserve(to, amount) {
		if (!web3.utils.isAddress(to)) { //Validate toAddress
			throw new Error("Invalid address");
		}
		try {
			var value = web3.utils.toWei(amount.toString(), "ether"); //Unit translation
	        var crowdsaleInstance = await this.Crowdsale.at(this.crowdsaleAddress);
	        var result = await crowdsaleInstance.reserve(to, value, {
	            from: this.account
	        });
	        console.log(result);
	        return result.tx;
		} catch(e) {
			//console.log(e);
			throw new Error(e);
		}
	}

	async cancelRsvp(to, amount) {
		if (!web3.utils.isAddress(to)) {
			throw new Error("Invalid address");
		}
		try {
			var value = web3.utils.toWei(amount.toString(), "ether"); //Unit translation
	        var crowdsaleInstance = await this.Crowdsale.at(this.crowdsaleAddress);
	        var result = await crowdsaleInstance.cancelRsvp(to, value, {
	            from: this.account
	        });
	        console.log(result);
	        return result.tx;
		} catch(e) {
			//console.log(e);
			throw new Error(e);
		}
	}	

	async balanceOf(addr) {
		if (!web3.utils.isAddress(addr)) {
			throw new Error("Invalid address");
		}
		try {
			var tokenInstance = await this.DemoToken.at(this.tokenAddress);
	        var balance = await tokenInstance.balanceOf.call(addr, 
	            {from: this.account});
	        console.log("balance: ", web3.utils.fromWei(
	        	balance.toString(10), "ether"));
	        return web3.utils.fromWei(balance.toString(10), "ether");
		} catch(e) {
			console.log(e);
			throw new Error(e);
		}
	}	
}


var controller = new TokenController(''); //Replace with actual controller address

async function init() {
	coinbase = await web3.eth.getCoinbase();
	console.log("Coinbase:", coinbase);
	controller.setAccount(coinbase);
	await controller.deployToken();
	await controller.deployCrowdsale();
	await Promise.all([controller.setMaxCap(1000),
	 controller.setFunder(controller.account)]);
	return;
}

//console.log("Deploying token");
/*
controller.deployToken()
	.then(res => controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44'))
	.then(res => controller.reserve('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		100))
	.then(res => controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		100, true))
	.then(res => controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44'));
*/

async function test() {
	//await init();

	console.log("Is address (expect true): ", web3.utils.isAddress(coinbase));
	console.log("Is address (expect false): ", web3.utils.isAddress('asdlfkj'));

	// Setup
	/*await controller.deployToken();
	await controller.deployCrowdsale();
	await Promise.all([controller.setMaxCap(1000),
	 controller.setFunder(controller.account)]);*/

	console.log("random balance: (expect 0) ");
	await controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');
	console.log("coinbase balance (expect 1000): ");
	await controller.balanceOf(controller.account);

	try { //Cannot issue more than reserved
		await controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		100, true);
		console.log("Reserved issue error");
	} catch(e) {
		console.log("Expected error: Cannot issue more than reserved", e.message);
	}

	try { //Cannot reserve more than cap
		await controller.reserve('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		1001);
		console.log("Reservation error");
	} catch(e) {
		console.log("Expected error: Cannot reserve more than cap", e.message);
	}
	await controller.reserve('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		100);

	try { //Cannot reserve more than cap
		await controller.reserve('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		901);
		console.log("Reservation error");
	} catch(e) {
		console.log("Expected error: Cannot reserve more than cap", e.message);
	}

	await controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		50, true);

	console.log("coinbase balance (expect 950): ");
	await controller.balanceOf(controller.account);
	console.log("recipient balance (expect 50): ");
	await controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');

	try { //Cannot cancel more than available reservation
		await controller.cancelRsvp('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		51, true);
		console.log("cancelRsvp error");
	} catch(e) {
		console.log("Expected error: Cannot cancel more than available reservation");
	}

	await controller.cancelRsvp('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		50, true);

	try { //Cannot issue more than reserved
		await controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		1, true);
		console.log("Reserved issue error");
	} catch(e) {
		console.log("Expected error: Cannot issue more than reserved");
	}

	await controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		1, false);
	
	console.log("coinbase balance (expect 949): ");
	await controller.balanceOf(controller.account);
	console.log("recipient balance (expect 51): ");
	await controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');

	try { //Cannot contribute more than cap
		await controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		951, false);
	} catch(e) {
		console.log("Expected error: Cannot contribute more than cap", e.message);
	}

	console.log("coinbase balance (expect 949): ");
	await controller.balanceOf(controller.account);
	console.log("recipient balance (expect 51): ");
	await controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');
}

async function test2() {
	coinbase = await web3.eth.getCoinbase();
	console.log("Coinbase:", coinbase);
	var account = await web3.eth.personal.newAccount("pass");
	console.log(account);
	try {
		await web3.eth.personal.unlockAccount(account, "wrong");
		console.log("Error: wrong password")
	} catch(e) {
		console.log("Expected error: wrong password", e.message);
	}

	try {
		await web3.eth.sendTransaction({from: account, to: coinbase,
			value: '1'});
		console.log("Error: locked account");
	} catch(e) {
		console.log("Expected error: locked account", e.message);
	}

	console.log("Unlock account: ",
		await web3.eth.personal.unlockAccount(account, "pass"));

	try {
		await web3.eth.sendTransaction({from: account, to: coinbase,
			value: '0'});
		console.log("Error: insufficient balance");
	} catch(e) {
		console.log("Expected error: insufficient balance", e.message);
	}

	console.log("Send: ", 
		await web3.eth.sendTransaction({from: coinbase, to: account,
			value: web3.utils.toWei("1")}));

	console.log("Account balance: ", await web3.eth.getBalance(account));

	try {
		await web3.eth.sendTransaction({from: account, to: coinbase,
			value: web3.utils.toWei("1")});
		console.log("Error: insufficient balance");
	} catch(e) {
		console.log("Expected error: insufficient balance", e.message);
	}

	console.log("Send from: ", await web3.eth.sendTransaction({from: account, 
		to: coinbase, value: web3.utils.toWei("0.5")}));

	console.log("Account balance: ", await web3.eth.getBalance(account));

	try {
		console.log("Consecutive sends...");
		var send = web3.eth.sendTransaction({from: account, 
			to: coinbase, value: web3.utils.toWei("0.3")});
		var send2 = web3.eth.sendTransaction({from: account, 
			to: coinbase, value: web3.utils.toWei("0.3")});
		//await Promise.all([send, send2]);
		//await send;
		//console.log("First send complete");
		//await send2;
		//console.log("Consecutive sends error");
	} catch(e) {
		console.log("Expected error: consecutive sends insufficient balance"
			, e.message);
	}

	//console.log("Account balance: ", await web3.eth.getBalance(account));

	console.log("Send from: ", await web3.eth.sendTransaction({from: account, 
		to: coinbase, value: web3.utils.toWei("0.1")}));

	console.log("Account balance: ", await web3.eth.getBalance(account));
	test();
}

//test2();
module.exports = controller;
init();
//test2();

