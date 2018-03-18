class CurrencyController {

	get name() {
		return "BTC";
	}

	walletValid(wallet) {
		return valid;
	}

	generateWallet() {
		return {sucess: sucess, wallet: wallet, privatek: privatek error: err};
	}

	balanceOf(wallet) {
		return {success: success, balance: balance, unit: unit, error: err};
	}

	send(from, to, amount, gas, unit) {
		//Send currency
		//Wait for enough confirmations

		//Bitcoin: use Regtest for testing, insight-api to confirm transactions
		return {success: success, error: err};
	}

	transactionConfirmed(from, to, amount, unit, txid) {
		//Bitcoin: use insight-api
		return confirmed;
	}


}

export default CurrencyController;