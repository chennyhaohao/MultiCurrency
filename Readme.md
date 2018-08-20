# Multicurrency Tokensale System
Traditionally, in tokensales of ERC20 tokens, only contributions in ETH are accepted. This system will allows users to purchase ERC20 tokens with other cryptocurrencies, such as BTC.  

## User flow
When using the system, a user will first have to sign up and potentially go through a KYC verification process. After logging in, the user will get to choose the currency with which to purchase tokens (currenctly only ETH & BTC will be supported).  

For simplicity, let's assume the user chooses BTC: each user will then have a BTC account in the system and they will able to see its balance. The website will also present the user with a BTC address, to which the user can send BTC to top up their account balance. After topping up the account, the user can then use the account balance to purchase tokens. The user will have to specify their Ethereum wallet address with which they will receive the tokens, and the amount of tokens to purchase (a conversion calculator will then automatically show them the corresponding cost in BTC). If the user confirms the purchase, the system backend will process the contribution by transferring BTC from the user's account to the team's multisig wallet, and if successful, issue tokens to the Ethereum address specified by the user.  

Due to the high transaction time of the blockchain, the processing can take up to 30 sec - 1.5 min. The webpage should prompt users with a "Transaction processing..." message, until the server returns the result (success/failure), upon which the webpage will display the result to the user. There will be also a panel where the user can input an Ethereum address and query its token balance, so that users can check whether the tokens have arrived in their wallet.  

If the user doesn't want to purchase any more tokens but still has left-over balance in their BTC account, they can choose to withdraw the BTC to their own wallet. The user will have to specify their own wallet address to which the BTC will be sent, and also the amount of BTC to withdraw. If the user confirms the withdrawal, the backend will then send the BTC to the address specified by the user.  

## Installation
To install the project, first clone this repository:  
```
$git clone https://github.com/chennyhaohao/MultiCurrency.git
```

Then go to the project directory and install dependencies for the `express` backend:  
```
$cd multi_currency && npm install
```
The `react` frontend project reside in the `client/` directory. Go to the `client/` directory and install dependencies for the frontend:  
```
$cd client && npm install
```
Apart from the npm packages, there are some additional blockchain-related dependencies we need to install. First, in order for the server to interact with the Bitcoin blockchain, we need to install `bitcoind`, a bitcoin daemon with a JSON-RPC interface. Download the binaries from the [official site](https://bitcoin.org/en/download). (Ignore the scary space requirement - for development we'll only be using the regtest mode, which won't require much space)  

Next, the server also need to interact with the Ethereum blockchain in order to issue tokens. For that we need to install `geth` - Go Ethereum, an implementation of Ethereum node also with a JSON-RPC interface. Follow the instructions on the [official site](https://geth.ethereum.org/install/) for installation.  

## Running the project 

First go to the project directory:  
```
$cd multi_currency
```
Start up the `bitcoind` daemon with our custum config file:  
```
$bitcoind -conf=./bitcoin.conf -datadir=./
```
(Note that it is important to add the `-conf` argument, as it tells the daemon to start in `regtest` mode. Otherwise the daemon will use its default configurations and start downloading the 145GB of data from the Bitcoin livenet!)  

Then start up the `geth` daemon in dev mode:  
```
$geth --dev --rpc --rpcport 8545 console
```


Now we can start up our `express` server. Go to the `/multi_currency` directory and run:  
```
$npm start
```

To start up the `react` frontend, go to the `/client` directory and run:
```
$npm start
``` 

Now we can view the site at http://localhost:3000

## Additional tips
When testing, you might want to be able to interact with the Bitcoin/Ethereum blockchain testnet, such as topping up an account with some "fake btc/eth" (I know I sometimes do that to feel rich :D).  

To do that, for Bitcoin you need `bitcoin-cli`, which is included in the `bitcore` package you downloaded. See this [link](https://bitcoin.org/en/developer-reference#rpcs) for references on how to use the client. For Ethereum, you can directly use the `geth` JavaScript console that spawns after you start up the geth node. See this [link](https://github.com/ethereumproject/go-ethereum/wiki/JavaScript-Console) for references.
