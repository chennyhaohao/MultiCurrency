var Web3 = require('web3');
var Promise = require("bluebird");
var Auth = require("../routes/Authentication.js");
var con = require("../routes/db.js");

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


class EthController {

	constructor() {
		this.multisig = "0x4FA9B933f1Ecaa4986191e570712BED7F1D46077";
	}

	get name() {
		return "ETH";
	}

	async addressValid(address) {
		return await web3.utils.isAddress(address);
	}

	async generateAddress(user) {
		var id = user.id.toString(); //get user id from request auth token
		var pass = Auth.sha256(id);
		var resolve, acc;
		var result = new Promise((res, rej) => {
			resolve = res; //Move resolve function to outside scope
		});
		try {
			con.query("SELECT * FROM users WHERE id=?", [id], async (err, user) => {
                if (err) {
                	throw new Error(e);
                }
                else if (user.length === 0) {
                    throw new Error("Invalid id");
                }
                else {
                	acc = user[0].eth_key;
                	if (acc != null) { //Account already created
                		console.log("replacing old account: ", acc);
                	}
                	console.log("creating eth account...");
                	acc = await web3.eth.personal.newAccount(pass);
                	con.query("UPDATE users SET eth_key=? WHERE id=?", 
                		[acc, id], function (err, user) {
		                if (err) throw err;
		                console.log("Account inserted: ", acc);
		                resolve(acc);
		            });
                }
            });
            return await result;
		} catch (e) {
			throw new Error(e);
		}
	}

	async getAddress(user) {
		if (user.eth_key == null) {
			console.log("Eth account not yet created");
			throw new Error("Eth account not yet created");
		} else {
			return user.eth_key;
		}
	}

	async balanceOf(user) {
		var acc, balance;
		try {
            acc = user.eth_key;
            if (!acc) {
            	console.log("Eth account not yet created");
            	throw new Error("Eth account not yet created");
            }
            balance = await web3.eth.getBalance(acc);
            balance = web3.utils.fromWei(balance.toString(10), "ether");
            console.log("Eth balance:", balance);
            return balance;
        } catch(e) {
			throw new Error(e);
		}
	}

	async safeSend(user, to, amount, gas, unit) {
		var acc = user.eth_key;
		if (!acc) {
        	console.log("Eth account not yet created");
        	throw new Error("Eth account not yet created");
        }

        if(!(await this.addressValid(to))){
        	throw new Error("Invalid address");
        }
		var id = user.id.toString(); //get user id from request auth token
		var pass = Auth.sha256(id);

        try {
        	amount = web3.utils.toWei(amount.toString(10), "ether");
        	await web3.eth.personal.unlockAccount(acc, pass, 5);
        	var result = await web3.eth.sendTransaction({from: acc, to: to,
				value: amount});
        	console.log(result);
        	return result.transactionHash;
        } catch(e) {
        	throw new Error(e);
        }
	}

	async sendToTeam(user, amount) {
		try {
			return (await this.safeSend(user, this.multisig, amount, 
				0, "eth"));
		} catch(e) {
			throw new Error(e);
		}
	}
}

var controller = new EthController();
/*
client.sendFrom('', "2NEzqZyPosKsm5tAjZvRh3g8MtEFB1WLifR", 
	100000, 6).then(res => console.log(res));
*/

module.exports = controller;