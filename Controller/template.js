class MultiCurrencyApp { //Core operations


	generateWallet(id, currency) {
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
		return {success: success, address: addr, error: err};
	}

	checkBalance(id, currency) {
		/*Check `id`s balance of `currency`*/
		//Check if id & wallet exists
		//Query balance from api
		return {success: success, balance: balance, unit: unit, error: err};
	}

	buyToken(id, amount, toWallet, currency) {
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
		return {success: success, amount: amount, error: err};
	}

	withdraw(id, amount, toWallet, currency) {
		/*Withdraw `amount` `currency` into `wallet`*/
		//Check id & wallet exists
		//Check wallet validity?
		//Get id's wallet and transfer the currency out
		//TODO: think about race condition (probly not)
		//TODO: gas problem
		return {success: success, amount: amount, error: err};
	}

}