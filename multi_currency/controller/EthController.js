var Web3 = require('web3');
var Promise = require("bluebird");
var Auth = require("../routes/Authentication.js");
var con = require("../routes/db.js");

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


class EthController {

	get name() {
		return "ETH";
	}

	addressValid(address) {
		return web3.utils.isAddress(address);
	}

	async generateAddress(id) {
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
                    if (acc == null) { //Account hasn't been created
                    	console.log("creating eth account...");
                    	acc = await web3.eth.personal.newAccount(pass);
                    	con.query("UPDATE users SET eth_key=? WHERE id=?", 
                    		[acc, id], function (err, user) {
			                if (err) throw err;
			                console.log("Account inserted: ", acc);
			                resolve(acc);
			            });
                    } else {
                    	console.log("Account: ", acc);
                    	resolve(acc);
                    }
                    
                }
            });
            return await result;
		} catch (e) {
			throw new Error(e);
		}
	}

	async balanceOf(id) {
		var acc, balance;
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
                    if (!acc) {
                    	console.log("Eth account not yet created");
                    	throw new Error("Eth account not yet created");
                    }
                    balance = await web3.eth.getBalance(acc);
                    balance = web3.utils.fromWei(balance.toString(10), "ether");
                    console.log("Eth balance:", balance);
                    return balance;
                }
            });
			
		} catch(e) {
			throw new Error(e);
		}
	}

	async send(fromID, to, amount, gas, unit) {
		//Send currency		
		//TODO: consider unit & gas
		/*amount = parseFloat(amount.toFixed(8)); //Bitcoin maximum precision
		
		try {
			return await client.sendFrom(fromID, to, amount, 
				this.safeConfirmationNumber);
		} catch (e) {
			throw new Error(e);
		}*/
	}


}

var controller = new EthController();
/*
client.sendFrom('', "2NEzqZyPosKsm5tAjZvRh3g8MtEFB1WLifR", 
	100000, 6).then(res => console.log(res));
*/

module.exports = controller;