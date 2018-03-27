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
console.log("Coinbase:", web3.eth.coinbase);
//console.log("Balance: ", web3.eth.getBalance('0x96d9b127c3fce317fba175c6390c173d009ba580'));
//console.log("Connected: ", web3.isConnected());

class TokenController {

	constructor(account) {
		this.DemoToken = contract(DemoToken_artifacts);
		this.Crowdsale = contract(Crowdsale_artifacts);
		this.DemoToken.setProvider(web3.currentProvider);
		this.Crowdsale.setProvider(web3.currentProvider);
		this.tokenAddress = '';
		this.crowdsaleAddress = '';
		this.account = account;
		console.log("TokenController initialized");
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
			var value = web3.toWei(maxCap, "ether"); //Unit translation
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
		if (!web3.isAddress(funder)) { //Validate funder address
			throw new Error("Invalid address", funder);
		}
		try {
			var [crowdsaleInstance, tokenInstance] = await Promise.all([
					this.Crowdsale.at(this.crowdsaleAddress),
					this.DemoToken.at(this.tokenAddress)
				]); //Getting instances
			await tokenInstance.approve(this.crowdsaleAddress, 
				web3.toWei(1000, "ether"), {
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
		if (!web3.isAddress(to)) { //Validate toAddress
			throw new Error("Invalid address");
		}
		try {
			var value = web3.toWei(amount, "ether"); //Unit translation
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
		if (!web3.isAddress(to)) { //Validate toAddress
			throw new Error("Invalid address");
		}
		try {
			var value = web3.toWei(amount, "ether"); //Unit translation
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
		if (!web3.isAddress(to)) {
			throw new Error("Invalid address");
		}
		try {
			var value = web3.toWei(amount, "ether"); //Unit translation
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
		if (!web3.isAddress(addr)) {
			throw new Error("Invalid address");
		}
		try {
			var tokenInstance = await this.DemoToken.at(this.tokenAddress);
	        var balance = await tokenInstance.balanceOf.call(addr, 
	            {from: this.account});
	        console.log("balance: ", web3.fromWei(balance.valueOf(), "ether"));
	        return web3.fromWei(balance.valueOf(), "ether");
		} catch(e) {
			console.log(e);
			throw new Error(e);
		}
	}	
}


var controller = new TokenController(web3.eth.coinbase); //Replace with actual controller address
/*await controller.deployToken();
await controller.deployCrowdsale();
await Promise.all([controller.setMaxCap(1000),
 controller.setFunder(controller.account)]);*/

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
	console.log("Is address (expect true): ", web3.isAddress(web3.eth.coinbase));
	console.log("Is address (expect false): ", web3.isAddress('asdlfkj'));

	// Setup
	await controller.deployToken();
	await controller.deployCrowdsale();
	await Promise.all([controller.setMaxCap(1000),
	 controller.setFunder(controller.account)]);

	console.log("random balance: (expect 0) ");
	await controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');
	console.log("coinbase balance (expect 1000): ");
	await controller.balanceOf(controller.account);

	try { //Cannot issue more than reserved
		await controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		100, true);
		console.log("Reserved issue error");
	} catch(e) {
		console.log("Expected error: Cannot issue more than reserved", e);
	}

	try { //Cannot reserve more than cap
		await controller.reserve('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		1001);
		console.log("Reservation error");
	} catch(e) {
		console.log("Expected error: Cannot reserve more than cap");
	}
	await controller.reserve('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		100);

	try { //Cannot reserve more than cap
		await controller.reserve('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		901);
		console.log("Reservation error");
	} catch(e) {
		console.log("Expected error: Cannot reserve more than cap");
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
		console.log("Expected error: Cannot contribute more than cap", e);
	}

	console.log("coinbase balance (expect 949): ");
	await controller.balanceOf(controller.account);
	console.log("recipient balance (expect 51): ");
	await controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');
}

test();

module.exports = controller;