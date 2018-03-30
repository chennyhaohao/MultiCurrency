import React from 'react';
import Navigation from '../Navigation/NavigationComponent';

class HomeComponent extends React.Component {
    state = {
        wallet: '',
        userid: '',
        btcBalance: 0,
        tokenBalance: 0,
        amount: 0,
        address: '',
        ethWallet: '',
        btcAddress: '',
        txid: '',
        msg: ''
    };

    constructor(props) {
        super(props);
        this.generateWallet = this.generateWallet.bind(this);
        this.inputHandler = this.inputHandler.bind(this);
        this.btcBalance = this.btcBalance.bind(this);
        this.tokenBalance = this.tokenBalance.bind(this);
        this.contributeSubmitHandler = this.contributeSubmitHandler.bind(this);
        this.withdrawBtcSubmitHandler = this.withdrawBtcSubmitHandler.bind(this);
    }

    componentDidMount() {
        /*fetch('/tokensale')
          .then(res => res.json())
          .then(res=>this.setState({text: res.balance}));*/
    }

    increment() {
        fetch('/users');
    }

    async test() {
        try {
            var res = await fetch('/tokensale/test');
            var result = await res.json();
            console.log(result);
        } catch (e) {
            console.log(e);
        }
    }

    generateWallet() {
        fetch('/tokensale/generate-wallet/btc/' + this.state.userid)
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if (!res.error) this.setState({ address: res.address });
            });
    }

    btcBalance() {
        fetch('/tokensale/balance/btc/' + this.state.userid)
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if (!res.error) {
                    this.setState({ btcBalance: res.balance });
                }
            }
            );
    }

    tokenBalance() {
        fetch('/tokensale/balance/token/' + this.state.ethWallet)
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if (!res.error) {
                    this.setState({ tokenBalance: res.balance });
                }
            });
    }

    inputHandler(e) {
        var target = e.target;
        var value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({ [target.name]: value });
    }

    contributeSubmitHandler(e) {
        e.preventDefault(); //Important! Control the form behavior!
        this.setState({ msg: "Transaction processing..." });
        fetch('/tokensale/contribute/btc', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(this.state) //Important! Stringify the payload!
        }).then(res => res.json())
            .then(res => {
                console.log(res);
                this.setState({ msg: "" });

                if (res.error) {
                    console.log(res.error);
                } else {
                    this.btcBalance();
                    this.tokenBalance();
                }
            });
    }

    withdrawBtcSubmitHandler(e) {
        e.preventDefault(); //Control the form behavior
        this.setState({ msg: "Transaction processing..." });
        fetch('/tokensale/withdraw/btc', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(this.state) //Stringify the payload
        }).then(res => res.json())
            .then(res => {
                console.log(res);
                this.setState({ msg: "" });

                if (res.error) {
                    console.log(res.error);
                } else {
                    this.btcBalance();
                    this.setState({ txid: res.txid });
                }
            });
    }

    render() {
        return (
            <div className="HomeComponent">
                <Navigation/>
                <p>Wallet: {this.state.wallet}</p>
                <button onClick={this.test}>test</button> <br />
                <button onClick={this.generateWallet}>generate btc wallet</button><br />
                Send to this address: <span>{this.state.address}</span>
                <form onSubmit={this.contributeSubmitHandler}>
                    User ID: <input
                    type='text'
                    name='userid'
                    onChange={this.inputHandler} /> <br />
                    Amount: <input
                    type='number'
                    name='amount'
                    onChange={this.inputHandler} /> <br />
                    Eth Wallet: <input
                    type='text'
                    name='ethWallet'
                    onChange={this.inputHandler} /> <br />
                    <input type="submit" value="contribute" />
                </form> <br />

                <form onSubmit={this.withdrawBtcSubmitHandler}>
                    Btc Wallet: <input
                    type='text'
                    name='btcAddress'
                    onChange={this.inputHandler} /> <br />
                    <input type="submit" value="withdraw btc" />
                </form> <br />

                BTC Balance: <span>{this.state.btcBalance}</span> <br />
                Token Balance: <span>{this.state.tokenBalance}</span> <br />
                <button onClick={this.btcBalance}>check btc balance</button>
                <button onClick={this.tokenBalance}>check token balance</button><br />
                <span>Status: {this.state.msg}</span> <br />
                <span>Txid: {this.state.txid} </span>
            </div>
        );
    }
}

export default HomeComponent;