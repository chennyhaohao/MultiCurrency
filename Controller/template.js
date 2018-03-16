class MultiCurrencyApp {
	createWallet(id, currency) {
		/*Create wallet address in `currency` for `id`*/
		//Check id exists
		//Check if there's already wallet; if so report err
		//Create wallet
		//Store in database in id's row
		return {success: success, address: addr, error: err};
	}

	checkBalance(id, currency) {
		/*Check `id`s balance of `currency`*/
		//Check if id & wallet exists
		//Query balance from api
		return {success: success, balance: balance, error: err};
	}

	buyToken(id, amount, ethWallet, currency) {
		/*Buy `amount` tokens into `ethWallet` with `currency`*/
		//Check id & wallet exists
		//Check wallet validity?
		//Check KYC limit
		//Calculate amount of currency to be deducted
		//Get id's wallet, check balance and transfer the currency out
		//Wait until succeeds and issue tokens
		//If token issue failed, send back currency?
		//TODO: gas problem
		return {success: success, amount: amount, error: err};
	}

	withdraw(id, amount, wallet, currency) {
		/*Withdraw `amount` `currency` into `wallet`*/
		//Check id & wallet exists
		//Check wallet validity?
		//Get id's wallet and transfer the currency out
		//TODO: think about race condition (probly not)
		//TODO: gas problem
		return {success: success, amount: amount, error: err};
	}



}