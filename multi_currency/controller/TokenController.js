var Web3 = require('web3');
var contract = require('truffle-contract');
var artifacts_path = './build/contracts/';
var DemoToken_artifacts = require(artifacts_path + 'DemoToken.json');

var web3;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

class TokenController {

	constructor(account) {
		this.DemoToken = contract(DemoToken_artifacts);
		this.DemoToken.setProvider(web3.currentProvider);
		this.tokenAddress = '';
		this.account = account;
		console.log("TokenController initialized");
	}

	async deployToken() {
		try {
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

	async issueToken(to, amount, reserved) {
		try {
			var value = web3.toWei(amount, "ether"); //Unit translation
	        var tokenInstance = await this.DemoToken.at(this.tokenAddress);
	        var result = await tokenInstance.issue(to, value, reserved, {
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
		try {
			var value = web3.toWei(amount, "ether"); //Unit translation
	        var tokenInstance = await this.DemoToken.at(this.tokenAddress);
	        var result = await tokenInstance.reserve(to, value, {
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
		try {
			var value = web3.toWei(amount, "ether"); //Unit translation
	        var tokenInstance = await this.DemoToken.at(this.tokenAddress);
	        var result = await tokenInstance.cancelRsvp(to, value, {
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


var controller = new TokenController('0x246682b5d38a4e791be9b75d7fec8a4e9680307d');
controller.deployToken();
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
	await controller.deployToken();
	controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');
	try { //Cannot issue more than reserved
		await controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		100, true);
		console.log("Reserved issue error");
	} catch(e) {
		console.log("Expected error: Cannot issue more than reserved");
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
	controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');
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
	controller.balanceOf('0xc48c902b59c5aea72664c9d60b30fde6fae03a44');
	try { //Cannot contribute more than cap
		await controller.issueToken('0xc48c902b59c5aea72664c9d60b30fde6fae03a44',
		951, false);
	} catch(e) {
		console.log("Expected error: Cannot contribute more than cap");
	}
}

//test();

module.exports = controller;