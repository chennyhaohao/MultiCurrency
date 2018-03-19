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
    		throw new Error(e);
    	}
	}	
}
/*
var controller;

web3.eth.getAccounts( (err, accs) => {
	if (err) {
		console.log("Error fetching accounts");
	} else if (accs.length == 0) {
		console.log("Cannot find accounts");
	} else {
		controller = new TokenController(accs[0]);
	}
});*/
var controller = new TokenController('0x246682b5d38a4e791be9b75d7fec8a4e9680307d');
controller.deployToken();

module.exports = controller;